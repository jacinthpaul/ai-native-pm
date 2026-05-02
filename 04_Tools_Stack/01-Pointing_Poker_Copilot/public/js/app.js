// ── Constants ─────────────────────────────────────────────────────────────────
const POINT_SCALE = [1, 2, 3, 5, 8];
const AVATAR_COLORS = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c','#3498db','#9b59b6','#e91e63','#00bcd4','#ff5722'];

const SPRINT_PAGE = 7;

// ── State ─────────────────────────────────────────────────────────────────────
let state = {
  view: 'setup',
  boards: [],
  selectedBoard: null,
  allSprints: [],
  shownSprints: SPRINT_PAGE,
  selectedSprint: null,
  issues: [],
  currentIndex: 0,
  teamMembers: [],        // [{ name, isAI, avatar?, color }]
  referenceStories: [],
  activeMember: null,     // name of member whose vote is being recorded
  votes: {},              // { memberName: points }
  revealed: false,
  consensus: null,
  aiEstimate: null,
  copilotCollapsed: false,
  scrumResult: null,
  chatHistory: [],
  sessionStats: [],       // [{ key, summary, consensus, skipped, saveError }]
  aiStatus: null,
  backlogMode: false,
};

// ── Utilities ─────────────────────────────────────────────────────────────────
function median(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : s[m - 1];
}
function closestScale(v) { return POINT_SCALE.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a); }
function escHtml(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function getAvatarColor(name) {
  let h = 0;
  for (const c of name) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getInitials(name) {
  const parts = name.trim().split(/[\s,]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatSprintDates(sprint) {
  if (!sprint.startDate && !sprint.endDate) return '';
  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '?';
  return `${fmt(sprint.startDate)} – ${fmt(sprint.endDate)}`;
}

function adfToHtml(node) {
  if (!node) return '';
  if (typeof node === 'string') return escHtml(node);
  const ch = (n) => (n.content || []).map(adfToHtml).join('');
  switch (node.type) {
    case 'doc': return ch(node);
    case 'paragraph': return `<p>${ch(node)}</p>`;
    case 'text': {
      let t = escHtml(node.text || '');
      (node.marks || []).forEach(m => {
        if (m.type === 'strong') t = `<strong>${t}</strong>`;
        else if (m.type === 'em') t = `<em>${t}</em>`;
        else if (m.type === 'code') t = `<code>${t}</code>`;
        else if (m.type === 'link') t = `<a href="${escHtml(m.attrs?.href)}" target="_blank">${t}</a>`;
        else if (m.type === 'strike') t = `<s>${t}</s>`;
      });
      return t;
    }
    case 'heading': return `<h${node.attrs?.level||2}>${ch(node)}</h${node.attrs?.level||2}>`;
    case 'bulletList': return `<ul>${ch(node)}</ul>`;
    case 'orderedList': return `<ol>${ch(node)}</ol>`;
    case 'listItem': return `<li>${ch(node)}</li>`;
    case 'codeBlock': return `<pre><code>${ch(node)}</code></pre>`;
    case 'blockquote': return `<blockquote>${ch(node)}</blockquote>`;
    case 'rule': return '<hr>';
    case 'hardBreak': return '<br>';
    case 'mention': return `<span class="mention">@${escHtml(node.attrs?.text||node.attrs?.id)}</span>`;
    default: return ch(node);
  }
}

function renderDescription(desc) {
  if (!desc) return '<em class="muted">No description provided.</em>';
  if (typeof desc === 'string') return `<p>${escHtml(desc)}</p>`;
  return adfToHtml(desc);
}

// ── DOM helpers ───────────────────────────────────────────────────────────────
const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
function show(...ids) { ids.forEach(id => { const e = $(id); if (e) e.style.display = ''; }); }
function hide(...ids) { ids.forEach(id => { const e = $(id); if (e) e.style.display = 'none'; }); }
function text(id, v) { const e = $(id); if (e) e.textContent = v; }
function html(id, v) { const e = $(id); if (e) e.innerHTML = v; }
function val(id) { const e = $(id); return e ? e.value.trim() : ''; }
function setVal(id, v) { const e = $(id); if (e) e.value = v; }

function toast(msg, type = 'info', dur = 3200) {
  const c = $('#toast-container'); if (!c) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  c.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  setTimeout(() => { el.classList.remove('visible'); setTimeout(() => el.remove(), 300); }, dur);
}

function setLoading(id, loading, label) {
  const e = $(id); if (!e) return;
  e.disabled = loading;
  if (label) e.textContent = loading ? '…' : label;
}

// ── View switching ────────────────────────────────────────────────────────────
function showView(name) {
  state.view = name;
  $$('.view').forEach(v => v.style.display = 'none');
  const el = $(`#view-${name}`);
  if (el) el.style.display = name === 'voting' ? 'block' : 'block';
}

// ── Config modal ──────────────────────────────────────────────────────────────
function openConfig() {
  const c = API.config.load();
  setVal('#cfg-jira-url', c.jiraUrl || '');
  setVal('#cfg-jira-email', c.jiraEmail || '');
  setVal('#cfg-jira-token', c.jiraToken || '');
  setVal('#cfg-ai-key', c.anthropicApiKey || '');
  setVal('#cfg-sp-field', c.storyPointsField || 'customfield_10336');
  $('#config-modal').classList.add('open');
}
function closeConfig() { $('#config-modal').classList.remove('open'); }

async function saveConfig() {
  const cfg = {
    jiraUrl: val('#cfg-jira-url'),
    jiraEmail: val('#cfg-jira-email'),
    jiraToken: val('#cfg-jira-token'),
    anthropicApiKey: val('#cfg-ai-key'),
    storyPointsField: val('#cfg-sp-field') || 'customfield_10336',
  };
  if (!cfg.jiraUrl || !cfg.jiraEmail || !cfg.jiraToken) { toast('Jira URL, email and token are required', 'error'); return; }
  API.config.save(cfg);
  toast('Configuration saved', 'success');
  closeConfig();
  await initSetup();
}

async function testJiraConnection() {
  setLoading('#btn-test-connection', true);
  try {
    const r = await API.jira.test();
    toast(`Connected as ${r.user}`, 'success');
  } catch (e) {
    toast(`Connection failed: ${e.message}`, 'error');
  } finally {
    setLoading('#btn-test-connection', false, 'Test Connection');
  }
}

// ── Setup view ────────────────────────────────────────────────────────────────
async function initSetup() {
  showView('setup');

  try {
    state.aiStatus = await API.ai.status();
    const badges = $$('#ai-status-badge, #ai-status-badge-vote');
    badges.forEach(b => {
      if (!b) return;
      b.textContent = state.aiStatus.mode === 'live' ? '🤖 AI Ready'
        : state.aiStatus.mode === 'mock' ? '🤖 AI (Mock)' : '🤖 AI Off';
      b.className = `ai-badge ai-${state.aiStatus.mode}`;
    });
  } catch { /* ignore */ }

  try {
    html('#board-select', '<option value="">Loading boards…</option>');
    const { boards } = await API.jira.boards();
    state.boards = boards;
    if (!boards.length) {
      html('#board-select', '<option value="">No boards found</option>');
      return;
    }
    html('#board-select', '<option value="">— Select a board —</option>' +
      boards.map(b => `<option value="${b.id}">${escHtml(b.name)}</option>`).join(''));
  } catch (e) {
    html('#board-select', '<option value="">Error loading boards</option>');
    if (e.message.includes('credentials') || e.message.includes('401')) {
      toast('Configure Jira credentials to get started', 'warning');
      openConfig();
    } else {
      toast(`Failed to load boards: ${e.message}`, 'error');
    }
  }
}

async function loadBoard() {
  const boardId = val('#board-select');
  if (!boardId) { toast('Select a board first', 'warning'); return; }

  const board = state.boards.find(b => String(b.id) === boardId);
  state.selectedBoard = board;
  state.selectedSprint = null;
  hide('#team-divider', '#team-section');

  setLoading('#btn-load-board', true);
  html('#sprint-list', '');
  const statusEl = $('#sprint-list-status');

  try {
    show('#sprint-list-wrap');
    if (statusEl) { statusEl.textContent = 'Loading sprints…'; statusEl.className = 'sprint-list-status'; }

    const { sprints } = await API.jira.sprints(boardId, 'active,future,closed');
    state.allSprints = sprints;
    state.shownSprints = SPRINT_PAGE;

    if (!sprints.length) {
      if (statusEl) statusEl.textContent = 'No sprints found for this board.';
      return;
    }

    const activeCount = sprints.filter(s => s.state === 'active').length;
    if (statusEl) {
      statusEl.textContent = `✓ Successfully loaded ${sprints.length} sprints from board ${boardId}`;
    }

    renderSprintList();

    if (sprints.length > SPRINT_PAGE) show('#btn-show-more');
    else hide('#btn-show-more');

    // Hint
    const hint = $('#board-hint');
    if (hint && board) {
      hint.style.display = '';
      hint.innerHTML = `Board: <strong>${escHtml(board.name)}</strong> · ${activeCount} active sprint${activeCount !== 1 ? 's' : ''}`;
    }
  } catch (e) {
    if (statusEl) { statusEl.textContent = `Error: ${e.message}`; statusEl.className = 'sprint-list-status error'; }
    toast(`Failed to load sprints: ${e.message}`, 'error');
  } finally {
    setLoading('#btn-load-board', false, 'Load Sprints');
  }
}

function renderSprintList() {
  const visible = state.allSprints.slice(0, state.shownSprints);
  html('#sprint-list', visible.map(s => `
    <div class="sprint-item ${state.selectedSprint?.id === s.id ? 'selected' : ''}"
         onclick="selectSprint(${s.id}, '${escHtml(s.name)}', '${s.state}')">
      <div class="sprint-item-left">
        <span class="sprint-item-name">${escHtml(s.name)}</span>
        <span class="sprint-item-dates">${formatSprintDates(s)}</span>
      </div>
      <span class="sprint-badge ${s.state}">${s.state}</span>
    </div>
  `).join(''));

  const btn = $('#btn-show-more');
  if (btn) btn.style.display = state.shownSprints < state.allSprints.length ? '' : 'none';
}

function showMoreSprints() {
  state.shownSprints += SPRINT_PAGE;
  renderSprintList();
}

async function selectSprint(id, name, stateLabel) {
  state.selectedSprint = { id, name, state: stateLabel };
  renderSprintList(); // re-render to highlight selected

  show('#team-divider', '#team-section');

  // Load team members
  const boardId = String(state.selectedBoard?.id);
  html('#team-list', '<span class="muted">Loading team…</span>');
  try {
    const { members } = await API.jira.team(boardId);
    renderTeamSetup(members);
  } catch {
    renderTeamSetup([]);
  }
}

function renderTeamSetup(members) {
  const cfg = API.config.load();
  const saved = cfg.savedTeam || [];
  const all = [...members];
  saved.forEach(sm => { if (!all.find(m => m.name === sm.name)) all.push(sm); });

  html('#team-list',
    `<div class="member-card ai-member" style="cursor:default">
       <div class="avatar-ai">🤖</div>
       <span class="member-card-name">AI Agent</span>
       <span class="ai-sub-label">Claude</span>
     </div>` +
    all.map(m => {
      const color = getAvatarColor(m.name);
      const initials = getInitials(m.name);
      const avatar = m.avatar
        ? `<img src="${escHtml(m.avatar)}" class="avatar-img">`
        : `<div class="avatar-circle" style="background:${color}">${initials}</div>`;
      return `
        <div class="member-card" data-name="${escHtml(m.name)}">
          <button class="remove-btn" onclick="removeMember('${escHtml(m.name)}')">×</button>
          ${avatar}
          <span class="member-card-name">${escHtml(m.name)}</span>
        </div>`;
    }).join('')
  );
}

function removeMember(name) {
  const card = document.querySelector(`.member-card[data-name="${CSS.escape(name)}"]`);
  if (card) card.remove();
  const cfg = API.config.load();
  if (cfg.savedTeam) {
    cfg.savedTeam = cfg.savedTeam.filter(m => m.name !== name);
    API.config.save(cfg);
  }
}

function addTeamMember() {
  const name = val('#new-member-name');
  if (!name) return;

  const cfg = API.config.load();
  cfg.savedTeam = cfg.savedTeam || [];
  if (!cfg.savedTeam.find(m => m.name === name)) { cfg.savedTeam.push({ name }); API.config.save(cfg); }

  const color = getAvatarColor(name);
  const initials = getInitials(name);
  const grid = $('#team-list');
  const card = document.createElement('div');
  card.className = 'member-card';
  card.dataset.name = name;
  card.innerHTML = `
    <button class="remove-btn" onclick="removeMember('${escHtml(name)}')">×</button>
    <div class="avatar-circle" style="background:${color}">${initials}</div>
    <span class="member-card-name">${escHtml(name)}</span>`;
  grid.appendChild(card);
  setVal('#new-member-name', '');
}

async function startSession(useBacklog = false) {
  if (!state.selectedBoard) { toast('Select a board first', 'warning'); return; }
  if (!useBacklog && !state.selectedSprint) { toast('Select a sprint first', 'warning'); return; }

  // Collect team from cards
  const memberCards = $$('#team-list .member-card[data-name]');
  const members = memberCards.map(c => ({
    name: c.dataset.name,
    isAI: false,
    color: getAvatarColor(c.dataset.name),
  }));

  // Always include AI agent
  state.teamMembers = [{ name: 'AI Agent', isAI: true }, ...members];

  if (members.length === 0) { toast('Add at least one team member', 'warning'); return; }

  state.backlogMode = useBacklog;
  setLoading('#btn-start', true);

  try {
    const boardId = String(state.selectedBoard.id);
    let issues;
    if (useBacklog) {
      ({ issues } = await API.jira.backlog(boardId));
    } else {
      ({ issues } = await API.jira.sprintIssues(state.selectedSprint.id));
    }

    state.issues = issues.filter(i => !['Epic'].includes(i.type));
    if (!state.issues.length) { toast('No pointable issues found', 'warning'); return; }

    // Load reference stories in background
    API.jira.referenceStories(boardId).then(({ stories }) => { state.referenceStories = stories; }).catch(() => {});

    state.currentIndex = 0;
    state.sessionStats = [];
    showVotingView();
  } catch (e) {
    toast(`Failed to load issues: ${e.message}`, 'error');
  } finally {
    setLoading('#btn-start', false, 'Start Pointing Session');
  }
}

// ── Voting view ───────────────────────────────────────────────────────────────
function showVotingView() {
  resetVotes();
  showView('voting');
  renderVotingView();
}

function resetVotes() {
  state.votes = {};
  state.revealed = false;
  state.consensus = null;
  state.aiEstimate = null;
  state.scrumResult = null;
  state.chatHistory = [];
  state.activeMember = null;
  state.copilotCollapsed = false;
}

function renderVotingView() {
  const issue = state.issues[state.currentIndex];
  if (!issue) { showStats(); return; }

  const total = state.issues.length;
  const current = state.currentIndex + 1;
  text('#progress-text', `Story ${current} of ${total}`);
  const pct = ((current - 1) / total) * 100;
  const fill = $('#progress-bar-fill');
  if (fill) fill.style.width = `${pct}%`;

  text('#session-title', state.selectedSprint?.name || (state.backlogMode ? 'Backlog' : 'Session'));

  // Story details
  const cfg = API.config.load();
  const jiraBase = (cfg.jiraUrl || '').replace(/\/$/, '');
  const keyLink = $('#issue-key-link');
  if (keyLink) { keyLink.href = jiraBase ? `${jiraBase}/browse/${issue.key}` : '#'; }
  text('#issue-key-val', issue.key);
  text('#issue-type', issue.type);
  text('#issue-summary', issue.summary);
  html('#issue-description', renderDescription(issue.description));

  text('#story-assignee', issue.assignee?.name || '—');
  text('#story-status', issue.status || '—');

  const epEl = $('#issue-epic');
  if (epEl) { if (issue.epicName || issue.epicKey) { epEl.style.display=''; epEl.textContent = issue.epicName || issue.epicKey; } else { epEl.style.display = 'none'; } }

  const ptEl = $('#existing-points');
  if (ptEl) { if (issue.storyPoints) { ptEl.style.display=''; ptEl.textContent = `Current: ${issue.storyPoints}pts`; } else { ptEl.style.display='none'; } }

  html('#issue-labels', (issue.labels||[]).map(l=>`<span class="label-chip">${escHtml(l)}</span>`).join(''));
  hide('#issue-priority');

  // Vote cards
  renderVoteCardRow();

  // Team votes
  renderTeamVotes();

  // Pre-reveal UI
  show('#vote-actions');
  hide('#results-panel', '#ai-estimate-panel');
  $('#btn-reveal').textContent = 'Reveal Votes';
  hide('#consensus-wrap');
  show('#btn-reveal', '#btn-revote', '#btn-skip');

  // Nav
  $('#btn-prev').disabled = state.currentIndex === 0;
  $('#btn-next').disabled = state.currentIndex >= state.issues.length - 1;

  // Live stats
  updateLiveStats();

  // Copilot questions (non-blocking)
  hide('#copilot-panel');
  if (state.aiStatus?.available) loadCopilotQuestions();
}

function renderVoteCardRow() {
  html('#vote-cards-row', POINT_SCALE.map(p => {
    const active = state.activeMember && state.votes[state.activeMember] === p;
    return `<div class="vote-card-btn ${active ? 'selected' : ''}" onclick="castVoteForActive(${p})">${p}</div>`;
  }).join(''));
}

function renderTeamVotes() {
  const container = $('#team-votes');
  if (!container) return;

  container.innerHTML = state.teamMembers.map(member => {
    const vote = state.votes[member.name];
    const isActive = state.activeMember === member.name;
    const initials = getInitials(member.name);
    const color = member.isAI ? '#2980b9' : (member.color || getAvatarColor(member.name));

    const avatar = member.isAI
      ? `<div class="vote-avatar" style="background:#2980b9;font-size:1.3rem">🤖</div>`
      : `<div class="vote-avatar" style="background:${color}">${initials}</div>`;

    let voteEl;
    if (state.revealed && vote !== undefined) {
      voteEl = `<div class="vote-display-val">${vote}</div>`;
    } else if (vote !== undefined) {
      voteEl = `<div class="vote-display-hidden">✓</div>`;
    } else {
      voteEl = `<div class="vote-display-empty">—</div>`;
    }

    let voteClass = '';
    if (state.revealed && vote !== undefined) {
      const allVals = Object.values(state.votes).filter(v => v !== undefined);
      const med = median(allVals);
      voteClass = Math.abs(vote - med) === 0 ? 'vote-match' : (Math.abs(vote - med) > 2 ? 'vote-outlier' : '');
    }

    const whyBtn = (state.revealed && member.isAI && vote !== undefined)
      ? `<button class="why-btn" onclick="toggleAIPanel(event)">Why?</button>` : '';

    const aiAskBtn = (!state.revealed && member.isAI && !state.aiEstimate)
      ? `<button class="why-btn" onclick="getAIEstimate()">Ask AI</button>` : '';

    return `
      <div class="vote-member-card ${isActive ? 'active-member' : ''} ${member.isAI ? 'ai-vote-card' : ''} ${voteClass}"
           onclick="${member.isAI ? 'getAIEstimate()' : `selectActiveMember('${escHtml(member.name)}')`}"
           title="${escHtml(member.name)}">
        ${avatar}
        <span class="vote-member-name">${escHtml(member.name)}</span>
        ${voteEl}
        ${whyBtn || aiAskBtn}
      </div>`;
  }).join('');
}

function selectActiveMember(name) {
  if (state.revealed) return;
  state.activeMember = state.activeMember === name ? null : name;
  renderVoteCardRow();
  renderTeamVotes();

  const hint = $('#vote-hint');
  if (hint) {
    if (state.activeMember) {
      hint.textContent = `Voting for: ${state.activeMember} — select a card below`;
      hint.className = 'vote-hint active-member-hint';
    } else {
      hint.textContent = 'Click a team member below, then select their vote';
      hint.className = 'vote-hint';
    }
  }
}

function castVoteForActive(points) {
  if (!state.activeMember) {
    toast('Click a team member card first to select who is voting', 'warning');
    return;
  }
  if (state.revealed) return;
  state.votes[state.activeMember] = points;
  renderVoteCardRow();
  renderTeamVotes();
  updateRevealBtn();
}

function castVote(memberName, points) {
  state.votes[memberName] = points;
  renderVoteCardRow();
  renderTeamVotes();
  updateRevealBtn();
}

function updateRevealBtn() {
  const nonAI = state.teamMembers.filter(m => !m.isAI);
  const voted = nonAI.filter(m => state.votes[m.name] !== undefined).length;
  const btn = $('#btn-reveal');
  if (btn) btn.textContent = voted === nonAI.length ? 'Reveal Votes' : `Reveal Votes (${voted}/${nonAI.length})`;
}

async function getAIEstimate() {
  if (state.aiEstimate) {
    toggleAIPanel();
    return;
  }
  const issue = state.issues[state.currentIndex];
  const aiMember = state.teamMembers.find(m => m.isAI);
  if (!aiMember) return;

  try {
    renderTeamVotes(); // show loading state
    state.aiEstimate = await API.ai.estimate(issue, state.referenceStories);
    state.votes[aiMember.name] = state.aiEstimate.points;
    renderTeamVotes();
    renderAIEstimatePanel();
    show('#ai-estimate-panel');
    updateRevealBtn();
  } catch (e) {
    toast(`AI estimate failed: ${e.message}`, 'error');
  }
}

function renderAIEstimatePanel() {
  if (!state.aiEstimate) return;
  const { points, rationale, confidence, risks } = state.aiEstimate;
  html('#ai-estimate-content', `
    <div class="ai-points-row">
      <span class="ai-pts">${points} pts</span>
      <span class="ai-confidence confidence-${confidence||'medium'}">${confidence||'medium'} confidence</span>
    </div>
    <p>${escHtml(rationale)}</p>
    ${risks ? `<p style="margin-top:8px;color:var(--amber)"><strong>Risk:</strong> ${escHtml(risks)}</p>` : ''}
  `);
}

function toggleAIPanel(e) {
  if (e) e.stopPropagation();
  const panel = $('#ai-estimate-panel');
  if (!panel) return;
  if (panel.style.display === 'none' || !panel.style.display) {
    renderAIEstimatePanel();
    show('#ai-estimate-panel');
  } else {
    hide('#ai-estimate-panel');
  }
}

// ── Copilot questions ─────────────────────────────────────────────────────────
async function loadCopilotQuestions() {
  const issue = state.issues[state.currentIndex];
  show('#copilot-panel');
  html('#copilot-body', '<span class="muted loading-dots">Loading questions</span>');
  hide('#copilot-footer');
  state.copilotCollapsed = false;
  $('#copilot-panel').querySelector('.copilot-toggle-btn').textContent = '−';

  try {
    const result = await API.ai.scrummaster(issue, {}, 0);
    const qs = result.questions || [];
    if (!qs.length) { hide('#copilot-panel'); return; }

    html('#copilot-body', qs.map((q, i) => `
      <div class="copilot-question"><strong>Q${i+1}:</strong> ${escHtml(q)}</div>
    `).join(''));
    show('#copilot-footer');
  } catch {
    hide('#copilot-panel');
  }
}

function toggleCopilotPanel() {
  state.copilotCollapsed = !state.copilotCollapsed;
  const body = $('#copilot-body');
  const footer = $('#copilot-footer');
  const btn = $('#copilot-panel')?.querySelector('.copilot-toggle-btn');
  if (body) body.style.display = state.copilotCollapsed ? 'none' : '';
  if (footer) footer.style.display = state.copilotCollapsed ? 'none' : '';
  if (btn) btn.textContent = state.copilotCollapsed ? '+' : '−';
}

function closeCopilotPanel() { hide('#copilot-panel'); }

// ── Reveal ────────────────────────────────────────────────────────────────────
function revealVotes() {
  if (!Object.keys(state.votes).length) { toast('No votes cast yet', 'warning'); return; }
  state.revealed = true;
  renderTeamVotes();

  const vals = Object.values(state.votes).filter(v => v !== undefined);
  const med = median(vals);
  state.consensus = closestScale(med);

  // Swap buttons
  hide('#btn-reveal');
  show('#consensus-wrap');

  // Set consensus dropdown
  setVal('#consensus-select', String(state.consensus));

  // Show results panel
  show('#results-panel');
  renderResultsPanel(vals, med, state.consensus);

  // Scrum master post-reveal
  loadPostRevealQuestions();
}

function renderResultsPanel(voteValues, med, cons) {
  text('#result-median', `${med}pts`);
  setVal('#consensus-select', String(cons));

  const dist = {};
  POINT_SCALE.forEach(p => dist[p] = 0);
  voteValues.forEach(v => { if (dist[v] !== undefined) dist[v]++; });
  const maxC = Math.max(...Object.values(dist));

  html('#vote-distribution', POINT_SCALE.map(p => `
    <div class="dist-col">
      <div class="dist-bar-wrap"><div class="dist-bar" style="height:${maxC ? (dist[p]/maxC)*55 : 0}px">${dist[p]||''}</div></div>
      <div class="dist-label">${p}</div>
    </div>
  `).join(''));
}

async function loadPostRevealQuestions() {
  const issue = state.issues[state.currentIndex];
  html('#scrum-questions', '<span class="muted loading-dots">Loading</span>');
  try {
    state.scrumResult = await API.ai.scrummaster(issue, state.votes, median(Object.values(state.votes).filter(v=>v!==undefined)));
    html('#scrum-questions', `
      <p class="scrum-summary">${escHtml(state.scrumResult.summary || '')}</p>
      <ul class="scrum-question-list">
        ${(state.scrumResult.questions||[]).map(q=>`<li>${escHtml(q)}</li>`).join('')}
      </ul>
    `);
  } catch (e) {
    html('#scrum-questions', `<em class="muted">Unavailable: ${escHtml(e.message)}</em>`);
  }
}

async function sendFollowup() {
  const input = $('#chat-input');
  const msg = input?.value?.trim();
  if (!msg) return;
  const issue = state.issues[state.currentIndex];
  state.chatHistory.push({ role: 'user', content: msg });
  input.value = '';
  renderChat();
  try {
    const r = await API.ai.followup(issue, { history: state.chatHistory.slice(-6), message: msg });
    state.chatHistory.push({ role: 'assistant', content: r.response });
  } catch (e) {
    state.chatHistory.push({ role: 'assistant', content: `Error: ${e.message}` });
  }
  renderChat();
}

function renderChat() {
  html('#chat-messages', state.chatHistory.map(m => `
    <div class="chat-msg chat-${m.role}">
      <strong>${m.role === 'user' ? 'You' : '🤖 Scrum Master'}</strong>
      ${escHtml(m.content)}
    </div>
  `).join(''));
  const c = $('#chat-messages');
  if (c) c.scrollTop = c.scrollHeight;
}

// ── Save & navigation ─────────────────────────────────────────────────────────
async function saveAndNext() {
  const issue = state.issues[state.currentIndex];
  const pts = Number($('#consensus-select')?.value);
  if (!pts) { toast('Select a consensus value', 'warning'); return; }

  state.consensus = pts;
  setLoading('#btn-save-next', true);
  try {
    await API.jira.updatePoints(issue.key, pts);
    state.sessionStats.push({ key: issue.key, summary: issue.summary, consensus: pts, skipped: false });
    toast(`${issue.key} → ${pts}pts saved`, 'success');
  } catch (e) {
    toast(`Save failed: ${e.message}. Recorded locally.`, 'error');
    state.sessionStats.push({ key: issue.key, summary: issue.summary, consensus: pts, skipped: false, saveError: true });
  } finally {
    setLoading('#btn-save-next', false, 'Save to Jira');
  }
  advanceStory();
}

function skipStory() {
  const issue = state.issues[state.currentIndex];
  state.sessionStats.push({ key: issue.key, summary: issue.summary, consensus: null, skipped: true });
  advanceStory();
}

function advanceStory() {
  if (state.currentIndex < state.issues.length - 1) {
    state.currentIndex++;
    resetVotes();
    renderVotingView();
  } else {
    showStats();
  }
}

function prevStory() { if (state.currentIndex > 0) { state.currentIndex--; resetVotes(); renderVotingView(); } }
function nextStory() { if (state.currentIndex < state.issues.length - 1) { state.currentIndex++; resetVotes(); renderVotingView(); } }
function revote() { resetVotes(); renderVotingView(); }

// ── Live stats ────────────────────────────────────────────────────────────────
function updateLiveStats() {
  const pointed = state.sessionStats.filter(s => !s.skipped).length;
  const remaining = Math.max(0, state.issues.length - state.currentIndex - 1);
  const total = state.sessionStats.filter(s => !s.skipped).reduce((sum, s) => sum + (s.consensus || 0), 0);
  text('#stats-live-pointed', pointed);
  text('#stats-live-remaining', remaining);
  text('#stats-live-points', total);
}

// ── Stats view ────────────────────────────────────────────────────────────────
function showStats() {
  showView('stats');
  const pointed = state.sessionStats.filter(s => !s.skipped);
  const skipped = state.sessionStats.filter(s => s.skipped);
  const errors = state.sessionStats.filter(s => s.saveError);
  const avg = pointed.length ? (pointed.reduce((s,i)=>s+(i.consensus||0),0)/pointed.length).toFixed(1) : '—';

  text('#stats-pointed', pointed.length);
  text('#stats-skipped', skipped.length);
  text('#stats-total', state.issues.length);
  text('#stats-avg', avg);

  const cfg = API.config.load();
  const base = (cfg.jiraUrl||'').replace(/\/$/,'');

  html('#stats-breakdown',
    pointed.map(s=>`
      <tr class="${s.saveError?'stat-error':''}">
        <td><a href="${base?`${base}/browse/${s.key}`:'#'}" target="_blank">${escHtml(s.key)}</a></td>
        <td>${escHtml(s.summary.slice(0,65))}${s.summary.length>65?'…':''}</td>
        <td class="stat-pts">${s.consensus}pts${s.saveError?' ⚠️':''}</td>
      </tr>`).join('') +
    skipped.map(s=>`
      <tr class="stat-skipped">
        <td>${escHtml(s.key)}</td>
        <td>${escHtml(s.summary.slice(0,65))}${s.summary.length>65?'…':''}</td>
        <td style="color:var(--gray-500)">skipped</td>
      </tr>`).join('')
  );

  if (errors.length) toast(`${errors.length} story/stories failed to save to Jira — verify manually`, 'warning', 6000);
}

function restartSession() { state.sessionStats = []; initSetup(); }

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Config
  $('#btn-open-config')?.addEventListener('click', openConfig);
  $('#btn-close-config')?.addEventListener('click', closeConfig);
  $('#btn-save-config')?.addEventListener('click', saveConfig);
  $('#btn-test-connection')?.addEventListener('click', testJiraConnection);
  $('#config-modal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeConfig(); });

  // Setup
  $('#btn-load-board')?.addEventListener('click', loadBoard);
  $('#btn-start')?.addEventListener('click', () => startSession(false));
  $('#btn-start-backlog')?.addEventListener('click', () => startSession(true));

  // Voting
  $('#btn-reveal')?.addEventListener('click', revealVotes);
  $('#btn-revote')?.addEventListener('click', revote);
  $('#btn-prev')?.addEventListener('click', prevStory);
  $('#btn-next')?.addEventListener('click', nextStory);
  $('#btn-skip')?.addEventListener('click', skipStory);
  $('#btn-save-next')?.addEventListener('click', saveAndNext);
  $('#btn-chat-send')?.addEventListener('click', sendFollowup);
  $('#chat-input')?.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFollowup(); } });

  // Stats
  $('#btn-new-session')?.addEventListener('click', restartSession);

  initSetup();
});
