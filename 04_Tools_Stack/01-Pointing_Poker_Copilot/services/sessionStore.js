// In-memory multiplayer Planning Poker rooms (no Jira / no AI required).
// Rooms live in process memory, so this requires a persistent (non-serverless) host.

const SCALES = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕'],
  simple:    ['1', '2', '3', '5', '8', '?'],
  tshirt:    ['XS', 'S', 'M', 'L', 'XL', '?'],
};

const rooms = new Map();          // roomId -> room
const EMPTY_TTL_MS = 1000 * 60 * 60 * 6; // reap empty rooms after 6h

function genId() {
  let id;
  do { id = String(Math.floor(100000 + Math.random() * 900000)); } while (rooms.has(id));
  return id;
}

function createRoom({ sessionName, scale } = {}) {
  const id = genId();
  const room = {
    id,
    name: sessionName && sessionName.trim() ? sessionName.trim().slice(0, 80) : `Session ${id}`,
    scale: SCALES[scale] ? scale : 'fibonacci',
    story: '',
    revealed: false,
    participants: new Map(),  // socketId -> { id, name, vote, isObserver, isHost }
    createdAt: Date.now(),
    emptyAt: Date.now(),
  };
  rooms.set(id, room);
  return room;
}

function getRoom(id) { return rooms.get(String(id || '').trim()); }

function addParticipant(room, socketId, name, isObserver = false) {
  const isHost = room.participants.size === 0;
  const clean = (name || '').trim().slice(0, 40) || 'Guest';
  room.participants.set(socketId, { id: socketId, name: clean, vote: null, isObserver: !!isObserver, isHost });
  room.emptyAt = null;
  return room.participants.get(socketId);
}

function removeParticipant(room, socketId) {
  const was = room.participants.get(socketId);
  room.participants.delete(socketId);
  // Reassign host if the host left.
  if (was && was.isHost) {
    const next = room.participants.values().next().value;
    if (next) next.isHost = true;
  }
  if (room.participants.size === 0) room.emptyAt = Date.now();
  return was;
}

function castVote(room, socketId, vote) {
  const p = room.participants.get(socketId);
  if (!p || p.isObserver) return;
  // Allow toggling a vote off, and only accept values on the room's scale.
  if (vote === null) { p.vote = null; return; }
  if (SCALES[room.scale].includes(String(vote))) p.vote = String(vote);
}

function reveal(room) { room.revealed = true; }

function resetVotes(room) {
  room.revealed = false;
  for (const p of room.participants.values()) p.vote = null;
}

function setStory(room, story) {
  room.story = String(story || '').slice(0, 300);
  // New story implies a fresh round.
  resetVotes(room);
}

function setObserver(room, socketId, isObserver) {
  const p = room.participants.get(socketId);
  if (p) { p.isObserver = !!isObserver; if (isObserver) p.vote = null; }
}

// Numeric stats over revealed numeric votes only.
function stats(room) {
  const nums = [...room.participants.values()]
    .filter(p => !p.isObserver && p.vote != null && !isNaN(Number(p.vote)))
    .map(p => Number(p.vote));
  if (!nums.length) return { count: 0, average: null, min: null, max: null, agreement: false };
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  const min = Math.min(...nums), max = Math.max(...nums);
  return {
    count: nums.length,
    average: Math.round(avg * 10) / 10,
    min, max,
    agreement: min === max,
  };
}

// Sanitized snapshot for clients — vote values hidden until revealed.
function publicState(room) {
  const voters = [...room.participants.values()].filter(p => !p.isObserver);
  const votedCount = voters.filter(p => p.vote != null).length;
  return {
    id: room.id,
    name: room.name,
    scale: room.scale,
    scaleValues: SCALES[room.scale],
    story: room.story,
    revealed: room.revealed,
    votedCount,
    voterCount: voters.length,
    participants: [...room.participants.values()].map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      isObserver: p.isObserver,
      hasVoted: p.vote != null,
      vote: room.revealed ? p.vote : null,
    })),
    stats: room.revealed ? stats(room) : null,
  };
}

function reapEmpty() {
  const now = Date.now();
  for (const [id, room] of rooms) {
    if (room.emptyAt && now - room.emptyAt > EMPTY_TTL_MS) rooms.delete(id);
  }
}
setInterval(reapEmpty, 1000 * 60 * 30).unref?.();

module.exports = {
  SCALES, rooms,
  createRoom, getRoom,
  addParticipant, removeParticipant,
  castVote, reveal, resetVotes, setStory, setObserver,
  publicState, stats,
};
