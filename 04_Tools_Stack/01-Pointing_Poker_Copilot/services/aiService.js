const Anthropic = require('@anthropic-ai/sdk');

let _client = null;

function getClient() {
  if (_client) return _client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key === 'MOCK') return null;
  _client = new Anthropic({ apiKey: key });
  return _client;
}

function getStatus() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { available: false, mode: 'unavailable', message: 'No API key configured' };
  if (key === 'MOCK') return { available: true, mode: 'mock', message: 'Mock mode active' };
  return { available: true, mode: 'live', message: 'AI features enabled' };
}

function extractText(description) {
  if (!description) return '';
  if (typeof description === 'string') return description;
  // ADF format
  const lines = [];
  function walk(node) {
    if (!node) return;
    if (node.type === 'text') lines.push(node.text || '');
    if (node.type === 'hardBreak') lines.push('\n');
    if (['paragraph', 'heading', 'listItem'].includes(node.type)) {
      (node.content || []).forEach(walk);
      lines.push('\n');
    } else {
      (node.content || []).forEach(walk);
    }
  }
  if (description.content) description.content.forEach(walk);
  return lines.join('').trim().slice(0, 1000);
}

const SYSTEM_PROMPT = `You are an experienced senior software engineer and Agile practitioner participating in a Planning Poker session. You estimate story points using the scale: 1, 2, 3, 5, 8.

Scale guide:
- 1: Trivial change, completely understood, near-zero risk
- 2: Small and straightforward, well-defined, minimal unknowns
- 3: Moderate effort, some design decisions, limited unknowns
- 5: Significant complexity, meaningful unknowns, real effort required
- 8: Very complex, high uncertainty, consider splitting

Always respond with valid JSON only.`;

async function getEstimate(story, referenceStories = [], githubContext = '') {
  const status = getStatus();

  if (status.mode !== 'live') {
    return mockEstimate(story);
  }

  const client = getClient();

  const refs = referenceStories
    .filter(r => r.storyPoints)
    .slice(0, 10)
    .map(r => `  - ${r.key} (${r.storyPoints}pts): ${r.summary}`)
    .join('\n');

  const descText = extractText(story.description);
  const githubCtx = githubContext ? `\n\nCode context from GitHub:\n${githubContext.slice(0, 500)}` : '';

  const messages = [
    {
      role: 'user',
      content: [
        ...(refs ? [{
          type: 'text',
          text: `Reference stories for calibration:\n${refs}`,
          cache_control: { type: 'ephemeral' },
        }] : []),
        {
          type: 'text',
          text: `Estimate this story and respond with JSON {"points": <1|2|3|5|8>, "rationale": "<2-3 sentences>", "confidence": "high|medium|low", "risks": "<optional one-liner>"}

Story: ${story.key || 'N/A'}
Type: ${story.type || 'Story'}
Priority: ${story.priority || 'Medium'}
Summary: ${story.summary}
Description: ${descText || 'No description provided'}${githubCtx}`,
        },
      ],
    },
  ];

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages,
  });

  return parseJSON(response.content[0]?.text, { points: 3, rationale: 'Unable to parse AI response', confidence: 'low' });
}

async function getScrumMasterQuestions(story, votes, median) {
  const status = getStatus();
  const hasVotes = votes && Object.keys(votes).length > 0;

  if (status.mode !== 'live') {
    return hasVotes ? mockScrumMasterQuestions(votes, median) : mockDiscussionQuestions(story);
  }

  const client = getClient();

  // Pre-vote mode: generate discussion questions about the story
  if (!hasVotes) {
    const desc = extractText(story.description).slice(0, 600);
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `You are a Scrum Master preparing a team for story point estimation.

Story: ${story.key} — ${story.summary}
Type: ${story.type || 'Story'} | Priority: ${story.priority || 'Medium'}
Description: ${desc || 'No description'}

Generate 3-5 clarifying questions the team should discuss BEFORE voting to ensure shared understanding and surface hidden complexity. Questions should probe scope, dependencies, technical risks, and acceptance criteria.

Respond with JSON: {"questions": ["...", "..."], "summary": "one sentence about why these questions matter for this story"}`,
      }],
    });
    return parseJSON(response.content[0]?.text, mockDiscussionQuestions(story));
  }

  // Post-vote mode: consensus questions
  const voteList = Object.entries(votes).map(([n, p]) => `${n}: ${p}pts`).join(', ');
  const values = Object.values(votes);
  const spread = Math.max(...values) - Math.min(...values);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 350,
    messages: [{
      role: 'user',
      content: `You are a Scrum Master. The team just revealed votes for story "${story.key}: ${story.summary}".

Votes: ${voteList}
Vote spread: ${spread} points
Median: ${median}pts

Generate 2-3 targeted questions to drive consensus. Focus on the gaps between ${spread > 2 ? 'the outliers' : 'any remaining uncertainty'}.

Respond with JSON: {"questions": ["...", "..."], "summary": "one sentence observation about the vote distribution"}`,
    }],
  });

  return parseJSON(response.content[0]?.text, mockScrumMasterQuestions(votes, median));
}

async function getFollowup(story, conversation) {
  const status = getStatus();

  if (status.mode !== 'live') {
    return { response: 'Mock mode: AI follow-up unavailable. Configure ANTHROPIC_API_KEY for live mode.' };
  }

  const client = getClient();
  const history = (conversation.history || []).map(m => ({
    role: m.role,
    content: m.content,
  }));

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: `You are a Scrum Master facilitating story point estimation. Current story: ${story.key} - ${story.summary}. Keep responses brief and focused on reaching consensus.`,
    messages: [
      ...history,
      { role: 'user', content: conversation.message },
    ],
  });

  return { response: response.content[0]?.text || '' };
}

function mockEstimate(story) {
  const len = (story.summary || '').length + (extractText(story.description) || '').length;
  const scale = [1, 2, 3, 5, 8];
  const idx = Math.min(Math.floor(len / 80), scale.length - 1);
  const points = scale[Math.max(0, idx)];
  return {
    points,
    rationale: `Mock estimate: story appears ${['trivial', 'small', 'moderate', 'complex', 'very complex'][idx]} based on description length. Replace with real AI for accurate estimates.`,
    confidence: 'low',
    risks: null,
  };
}

function mockDiscussionQuestions(story) {
  return {
    questions: [
      'Do we all have the same understanding of the full scope?',
      'Are there dependencies on other teams or systems we haven\'t accounted for?',
      'What are the acceptance criteria — and are they well-defined enough to estimate confidently?',
    ],
    summary: 'Pre-vote discussion to align on scope and surface unknowns.',
  };
}

function mockScrumMasterQuestions(votes, median) {
  const values = Object.values(votes);
  const spread = values.length ? Math.max(...values) - Math.min(...values) : 0;
  const hasSpread = spread > 2;

  return {
    questions: hasSpread ? [
      'What assumptions are driving the higher estimates?',
      'Are there hidden dependencies or integration points we haven\'t discussed?',
      'Could this story be split to reduce uncertainty?',
    ] : [
      'Is everyone aligned on the acceptance criteria?',
      'Are there any technical risks or unknowns we should flag?',
    ],
    summary: `Votes show ${hasSpread ? `notable spread of ${spread}pts — worth discussing` : 'good alignment'}. Median: ${median}pts.`,
  };
}

function parseJSON(text, fallback) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* ignore */ }
    }
    return fallback;
  }
}

module.exports = { getStatus, getEstimate, getScrumMasterQuestions, getFollowup };
