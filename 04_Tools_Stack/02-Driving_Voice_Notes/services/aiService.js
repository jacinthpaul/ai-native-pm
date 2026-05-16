const Anthropic = require('@anthropic-ai/sdk');

let client = null;

function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

function parseJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

async function extractActionItems(transcription) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return mockExtract(transcription);
  }

  const response = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: `You are a personal assistant extracting concrete action items from casual voice notes recorded while driving. The speaker uses stream-of-consciousness speech.

Rules:
- Extract ONLY concrete actions, not observations or filler
- Start each item with an action verb (Call, Email, Review, Schedule, Buy, etc.)
- Include names and deadlines if mentioned
- Merge items that are clearly about the same action
- Return valid JSON only, no markdown fences`,
    messages: [
      {
        role: 'user',
        content: `Extract action items from this transcription. Return JSON in this exact format:
{"actionItems": [{"text": "Call Marcus about Q3 roadmap by Friday"}], "summary": "One sentence summary"}
If nothing actionable, return: {"actionItems": [], "summary": "No actionable items identified"}

Transcription:
"""
${transcription}
"""`,
      },
    ],
  });

  const parsed = parseJSON(response.content[0].text);
  if (!parsed) {
    throw new Error('Claude returned unparseable JSON');
  }
  return parsed;
}

function mockExtract(transcription) {
  const sentences = transcription.split(/[.!?]+/).filter((s) => s.trim().length > 5);
  return {
    actionItems: sentences.slice(0, 3).map((s) => ({
      text: s.trim().replace(/^(i need to|i should|remind me to|don't forget to)\s*/i, ''),
    })),
    summary: 'Mock extraction — set ANTHROPIC_API_KEY to use Claude',
  };
}

module.exports = { extractActionItems };
