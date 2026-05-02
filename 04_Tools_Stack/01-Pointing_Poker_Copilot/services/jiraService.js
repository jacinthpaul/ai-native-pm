const fetch = require('node-fetch');
const https = require('https');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const STORY_POINTS_FIELDS = [
  process.env.JIRA_STORY_POINTS_FIELD || 'customfield_10336',
  'customfield_10016',
  'customfield_10028',
  'story_points',
];

function getConfig(overrides = {}) {
  return {
    url: overrides.url || process.env.JIRA_URL,
    email: overrides.email || process.env.JIRA_EMAIL,
    token: overrides.token || process.env.JIRA_API_TOKEN,
    storyPointsField: overrides.storyPointsField || process.env.JIRA_STORY_POINTS_FIELD || 'customfield_10336',
  };
}

function authHeader(email, token) {
  return `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;
}

async function jiraFetch(path, opts = {}, config = {}) {
  const { url, email, token } = getConfig(config);
  if (!url || !email || !token) throw new Error('Jira credentials not configured');

  const base = url.replace(/\/$/, '');
  const res = await fetch(`${base}${path}`, {
    ...opts,
    headers: {
      Authorization: authHeader(email, token),
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(opts.headers || {}),
    },
    agent: httpsAgent,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`Jira ${res.status}: ${body}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

function extractStoryPoints(fields) {
  for (const field of STORY_POINTS_FIELDS) {
    const val = fields?.[field];
    if (val !== null && val !== undefined) return val;
  }
  return null;
}

function normalizeIssue(issue) {
  const f = issue.fields || {};
  return {
    key: issue.key,
    id: issue.id,
    summary: f.summary || '',
    description: f.description || null,
    type: f.issuetype?.name || 'Story',
    typeIconUrl: f.issuetype?.iconUrl || null,
    status: f.status?.name || '',
    priority: f.priority?.name || 'Medium',
    priorityIconUrl: f.priority?.iconUrl || null,
    assignee: f.assignee ? {
      name: f.assignee.displayName,
      email: f.assignee.emailAddress,
      avatar: f.assignee.avatarUrls?.['48x48'],
    } : null,
    storyPoints: extractStoryPoints(f),
    epicKey: f.customfield_10014 || f.parent?.key || null,
    epicName: f.customfield_10014 ? null : (f.parent?.fields?.summary || null),
    labels: f.labels || [],
    subtasks: (f.subtasks || []).map(s => ({ key: s.key, summary: s.fields?.summary })),
    raw: f,
  };
}

async function getBoards(config = {}) {
  const data = await jiraFetch('/rest/agile/1.0/board?maxResults=50', {}, config);
  return (data.values || []).map(b => ({ id: b.id, name: b.name, type: b.type, projectKey: b.location?.projectKey }));
}

async function getSprints(boardId, state = 'active,future', config = {}) {
  const data = await jiraFetch(
    `/rest/agile/1.0/board/${boardId}/sprint?state=${state}&maxResults=50`,
    {}, config
  );
  return (data.values || []).map(s => ({
    id: s.id,
    name: s.name,
    state: s.state,
    startDate: s.startDate,
    endDate: s.endDate,
    goal: s.goal,
  }));
}

async function getSprintIssues(sprintId, config = {}) {
  const fields = [
    'summary', 'description', 'issuetype', 'status', 'priority',
    'assignee', 'labels', 'subtasks', 'parent',
    'customfield_10014', 'customfield_10336', 'customfield_10016',
    'customfield_10028', 'story_points',
  ].join(',');

  let startAt = 0;
  let all = [];

  while (true) {
    const data = await jiraFetch(
      `/rest/agile/1.0/sprint/${sprintId}/issue?startAt=${startAt}&maxResults=100&fields=${fields}`,
      {}, config
    );
    const issues = data.issues || [];
    all = all.concat(issues);
    if (all.length >= (data.total || 0) || issues.length === 0) break;
    startAt += 100;
  }

  return all.map(normalizeIssue);
}

async function getBacklogIssues(boardId, config = {}) {
  const fields = [
    'summary', 'description', 'issuetype', 'status', 'priority',
    'assignee', 'labels', 'parent',
    'customfield_10014', 'customfield_10336', 'customfield_10016',
  ].join(',');

  const data = await jiraFetch(
    `/rest/agile/1.0/board/${boardId}/backlog?maxResults=100&fields=${fields}`,
    {}, config
  );
  return (data.issues || []).map(normalizeIssue);
}

async function updateStoryPoints(issueKey, points, config = {}) {
  const cfg = getConfig(config);
  const body = { fields: { [cfg.storyPointsField]: points } };

  try {
    await jiraFetch(`/rest/api/2/issue/${issueKey}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }, config);
    return { success: true };
  } catch (e) {
    // Fallback: try customfield_10016
    if (cfg.storyPointsField !== 'customfield_10016') {
      await jiraFetch(`/rest/api/2/issue/${issueKey}`, {
        method: 'PUT',
        body: JSON.stringify({ fields: { customfield_10016: points } }),
      }, config);
      return { success: true, usedFallback: true };
    }
    throw e;
  }
}

async function getEpicContext(epicKey, config = {}) {
  if (!epicKey) return null;
  try {
    const issue = await jiraFetch(
      `/rest/api/2/issue/${epicKey}?fields=summary,description,customfield_10336,customfield_10016,status`,
      {}, config
    );
    return normalizeIssue(issue);
  } catch {
    return null;
  }
}

async function getTeamMembers(boardId, config = {}) {
  try {
    const sprints = await getSprints(boardId, 'active', config);
    const sprintToUse = sprints[0];
    if (!sprintToUse) return [];

    const issues = await getSprintIssues(sprintToUse.id, config);
    const seen = new Map();
    for (const issue of issues) {
      if (issue.assignee && !seen.has(issue.assignee.email)) {
        seen.set(issue.assignee.email, issue.assignee);
      }
    }
    return Array.from(seen.values());
  } catch {
    return [];
  }
}

async function getReferenceStories(boardId, config = {}) {
  try {
    const sprints = await getSprints(boardId, 'closed', config);
    if (!sprints.length) return [];

    const recent = sprints.slice(-2);
    let stories = [];
    for (const sprint of recent) {
      const issues = await getSprintIssues(sprint.id, config);
      const pointed = issues.filter(i => i.storyPoints && i.storyPoints > 0);
      stories = stories.concat(pointed.slice(0, 10));
      if (stories.length >= 20) break;
    }
    return stories.slice(0, 20);
  } catch {
    return [];
  }
}

async function testConnection(config = {}) {
  const data = await jiraFetch('/rest/api/2/myself', {}, config);
  return { success: true, user: data.displayName, email: data.emailAddress };
}

module.exports = {
  getBoards,
  getSprints,
  getSprintIssues,
  getBacklogIssues,
  updateStoryPoints,
  getEpicContext,
  getTeamMembers,
  getReferenceStories,
  testConnection,
};
