// ── Multiplayer Quick Session (socket.io) ───────────────────────────────────
// Reuses helpers from app.js: showView, $, $$, toast, escHtml, getInitials, getAvatarColor

const mp = {
  socket: null,
  selfId: null,
  state: null,     // latest public room state
  myVote: null,
};

// ── Routing ─────────────────────────────────────────────────────────────────
function routeInitial() {
  const m = location.pathname.match(/^\/(\d{4,8})$/);
  if (m) {
    showQuickSession();
    setVal('#q-join-id', m[1]);
    const hint = $('#quick-join-hint');
    if (hint) hint.textContent = `You're joining session ${m[1]} — enter your name and click Join.`;
    setTimeout(() => $('#q-join-name')?.focus(), 100);
  } else {
    showView('landing');
  }
}

function showLanding() {
  if (mp.socket) { try { mp.socket.emit('leave'); } catch {} }
  history.replaceState({}, '', '/');
  showView('landing');
}

function showQuickSession() { showView('quick'); }

// ── Socket lifecycle ──────────────────────────────────────────────────────────
function ensureSocket() {
  if (mp.socket) return mp.socket;
  mp.socket = io();

  mp.socket.on('joined', ({ selfId, room }) => {
    mp.selfId = selfId;
    mp.state = room;
    history.replaceState({}, '', `/${room.id}`);
    showView('room');
    renderRoom();
  });

  mp.socket.on('room-update', (room) => {
    mp.state = room;
    // Keep local vote selection in sync with server truth.
    const me = room.participants.find(p => p.id === mp.selfId);
    if (me && !room.revealed && !me.hasVoted) mp.myVote = null;
    if (mp.state && $('#view-room').style.display !== 'none') renderRoom();
  });

  mp.socket.on('join-error', ({ message }) => {
    const hint = $('#quick-join-hint');
    if (hint) { hint.textContent = message; hint.className = 'quick-join-hint error'; }
    toast(message, 'error');
    setLoading('#btn-join-session', false, 'Join Session');
  });

  mp.socket.on('disconnect', () => toast('Disconnected — reconnecting…', 'warning'));
  mp.socket.on('connect', () => { /* reconnects handled by re-emit on user action */ });

  return mp.socket;
}

// ── Create / Join ───────────────────────────────────────────────────────────
function createSession() {
  const name = val('#q-host-name');
  if (!name) { toast('Enter your name first', 'warning'); $('#q-host-name')?.focus(); return; }
  setLoading('#btn-create-session', true);
  ensureSocket().emit('create-session', {
    name,
    sessionName: val('#q-session-name'),
    scale: val('#q-scale') || 'fibonacci',
  });
  setTimeout(() => setLoading('#btn-create-session', false, 'Create Session'), 1500);
}

function joinSession() {
  const id = val('#q-join-id');
  const name = val('#q-join-name');
  if (!id) { toast('Enter the session code', 'warning'); $('#q-join-id')?.focus(); return; }
  if (!name) { toast('Enter your name', 'warning'); $('#q-join-name')?.focus(); return; }
  setLoading('#btn-join-session', true);
  ensureSocket().emit('join-session', { id, name, isObserver: $('#q-observer')?.checked });
  setTimeout(() => setLoading('#btn-join-session', false, 'Join Session'), 1500);
}

// ── Room rendering ────────────────────────────────────────────────────────────
function renderRoom() {
  const s = mp.state;
  if (!s) return;

  text('#room-title', s.name);
  text('#room-code', s.id);
  const link = `${location.origin}/${s.id}`;
  setVal('#room-link', link);

  // Story
  const cur = $('#room-story-current');
  if (cur) cur.textContent = s.story ? `Estimating: ${s.story}` : 'No story set yet — anyone can set one above.';

  const me = s.participants.find(p => p.id === mp.selfId);
  const amObserver = me?.isObserver;

  // Vote cards (hidden for observers)
  const voteSection = $('#room-vote-section');
  if (voteSection) voteSection.style.display = amObserver ? 'none' : '';
  text('#room-you-label', amObserver ? '' : (me ? `— you're ${me.name}` : ''));

  html('#room-vote-cards', (s.scaleValues || []).map(v => {
    const selected = mp.myVote === String(v) ? 'selected' : '';
    return `<div class="vote-card-btn ${selected}" data-vote="${escHtml(v)}">${escHtml(v)}</div>`;
  }).join(''));
  $$('#room-vote-cards .vote-card-btn').forEach(el => {
    el.addEventListener('click', () => castMyVote(el.dataset.vote));
  });

  // Progress
  text('#room-vote-progress', `(${s.votedCount}/${s.voterCount} voted)`);

  // Participants
  html('#room-participants', s.participants.map(p => {
    const color = getAvatarColor(p.name);
    const initials = getInitials(p.name);
    let voteEl;
    if (p.isObserver) voteEl = `<div class="vote-display-empty">👁</div>`;
    else if (s.revealed && p.vote != null) voteEl = `<div class="vote-display-val">${escHtml(p.vote)}</div>`;
    else if (p.hasVoted) voteEl = `<div class="vote-display-hidden">✓</div>`;
    else voteEl = `<div class="vote-display-empty">…</div>`;

    let cls = '';
    if (s.revealed && s.stats && p.vote != null && !isNaN(Number(p.vote))) {
      const n = Number(p.vote);
      if (s.stats.min === s.stats.max) cls = 'vote-match';
      else if (n === s.stats.min || n === s.stats.max) cls = 'vote-outlier';
    }

    return `
      <div class="vote-member-card ${cls} ${p.id === mp.selfId ? 'active-member' : ''}" title="${escHtml(p.name)}">
        <div class="vote-avatar" style="background:${color}">${initials}</div>
        <span class="vote-member-name">${escHtml(p.name)}${p.isHost ? ' 👑' : ''}</span>
        ${voteEl}
      </div>`;
  }).join(''));

  // Results
  const results = $('#room-results');
  if (s.revealed && s.stats && s.stats.count) {
    results.style.display = '';
    text('#room-avg', s.stats.average);
    text('#room-agreement', s.stats.agreement ? '✅ Yes' : '🔀 No');
    renderRoomDistribution(s);
  } else {
    results.style.display = 'none';
  }

  // Reveal/Reset button states
  const revealBtn = $('#btn-room-reveal');
  if (revealBtn) {
    revealBtn.textContent = s.revealed ? 'Revealed' : `Reveal Cards`;
    revealBtn.disabled = s.revealed || s.votedCount === 0;
  }
}

function renderRoomDistribution(s) {
  const dist = {};
  (s.scaleValues || []).forEach(v => dist[v] = 0);
  s.participants.forEach(p => { if (!p.isObserver && p.vote != null) dist[p.vote] = (dist[p.vote] || 0) + 1; });
  const used = (s.scaleValues || []).filter(v => dist[v] > 0);
  const maxC = Math.max(1, ...used.map(v => dist[v]));
  html('#room-distribution', used.map(v => `
    <div class="dist-col">
      <div class="dist-bar-wrap"><div class="dist-bar" style="height:${(dist[v] / maxC) * 55}px">${dist[v]}</div></div>
      <div class="dist-label">${escHtml(v)}</div>
    </div>
  `).join('') || '<span class="muted">No numeric votes</span>');
}

// ── Room actions ──────────────────────────────────────────────────────────────
function castMyVote(vote) {
  if (mp.state?.revealed) { toast('Cards are revealed — start a New Round to re-vote', 'warning'); return; }
  mp.myVote = (mp.myVote === String(vote)) ? null : String(vote);  // toggle
  mp.socket.emit('cast-vote', { vote: mp.myVote });
  renderRoom();
}

function setRoomStory() {
  const story = val('#room-story-input');
  mp.socket.emit('set-story', { story });
  setVal('#room-story-input', '');
}

function copyInviteLink() {
  const link = $('#room-link')?.value;
  if (!link) return;
  navigator.clipboard?.writeText(link).then(
    () => toast('Invite link copied', 'success'),
    () => { $('#room-link').select(); document.execCommand('copy'); toast('Invite link copied', 'success'); }
  );
}

function leaveRoom() {
  if (mp.socket) mp.socket.emit('leave');
  mp.myVote = null;
  mp.state = null;
  showLanding();
}

// ── Bootstrap (runs after app.js listener) ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  $('#mode-quick')?.querySelector('.btn-red')?.addEventListener('click', showQuickSession);
  $('#mode-quick-join')?.addEventListener('click', showQuickSession);
  $('#mode-jira')?.querySelector('.btn-dark')?.addEventListener('click', () => initSetup());
  $('#btn-quick-back')?.addEventListener('click', showLanding);

  $('#btn-create-session')?.addEventListener('click', createSession);
  $('#btn-join-session')?.addEventListener('click', joinSession);
  $('#q-join-id')?.addEventListener('keydown', e => { if (e.key === 'Enter') $('#q-join-name')?.focus(); });
  $('#q-join-name')?.addEventListener('keydown', e => { if (e.key === 'Enter') joinSession(); });
  $('#q-host-name')?.addEventListener('keydown', e => { if (e.key === 'Enter') createSession(); });

  $('#btn-set-story')?.addEventListener('click', setRoomStory);
  $('#room-story-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') setRoomStory(); });
  $('#btn-room-reveal')?.addEventListener('click', () => mp.socket?.emit('reveal'));
  $('#btn-room-reset')?.addEventListener('click', () => { mp.myVote = null; mp.socket?.emit('reset'); });
  $('#btn-copy-link')?.addEventListener('click', copyInviteLink);
  $('#room-code-chip')?.addEventListener('click', copyInviteLink);
  $('#btn-leave-room')?.addEventListener('click', leaveRoom);
});
