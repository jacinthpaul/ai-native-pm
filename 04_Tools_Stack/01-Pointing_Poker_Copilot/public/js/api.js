// Backend API wrapper — reads Jira credentials from localStorage if not in .env
const CONFIG_KEY = 'planningPoker_config';

function loadConfig() {
  try { return JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}'); } catch { return {}; }
}

function saveConfig(cfg) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
}

function jiraHeaders() {
  const c = loadConfig();
  const h = {};
  if (c.jiraUrl) h['X-Jira-Url'] = c.jiraUrl;
  if (c.jiraEmail) h['X-Jira-Email'] = c.jiraEmail;
  if (c.jiraToken) h['X-Jira-Token'] = c.jiraToken;
  if (c.storyPointsField) h['X-Story-Points-Field'] = c.storyPointsField;
  return h;
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...jiraHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const API = {
  config: { load: loadConfig, save: saveConfig },

  jira: {
    test: () => apiFetch('/jira/test'),
    boards: () => apiFetch('/jira/boards'),
    sprints: (boardId, state) => apiFetch(`/jira/boards/${boardId}/sprints?state=${state || 'active,future'}`),
    sprintIssues: (sprintId) => apiFetch(`/jira/sprints/${sprintId}/issues`),
    backlog: (boardId) => apiFetch(`/jira/boards/${boardId}/backlog`),
    team: (boardId) => apiFetch(`/jira/boards/${boardId}/team`),
    referenceStories: (boardId) => apiFetch(`/jira/boards/${boardId}/reference-stories`),
    updatePoints: (issueKey, points) => apiFetch(`/jira/issues/${issueKey}/storypoints`, {
      method: 'PUT',
      body: JSON.stringify({ points }),
    }),
    epicContext: (epicKey) => apiFetch(`/jira/issues/${epicKey}/epic`),
  },

  ai: {
    status: () => apiFetch('/ai/status'),
    estimate: (story, referenceStories, githubContext) => apiFetch('/ai/estimate', {
      method: 'POST',
      body: JSON.stringify({ story, referenceStories, githubContext }),
    }),
    scrummaster: (story, votes, median) => apiFetch('/ai/scrummaster', {
      method: 'POST',
      body: JSON.stringify({ story, votes, median }),
    }),
    followup: (story, conversation) => apiFetch('/ai/followup', {
      method: 'POST',
      body: JSON.stringify({ story, conversation }),
    }),
  },
};
