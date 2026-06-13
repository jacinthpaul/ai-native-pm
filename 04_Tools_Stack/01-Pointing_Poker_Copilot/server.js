require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const session = require('./services/sessionStore');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/jira', require('./routes/jira'));
app.use('/api/ai', require('./routes/ai'));

// Lightweight REST helper so the client can check a room exists before joining.
app.get('/api/session/:id', (req, res) => {
  const room = session.getRoom(req.params.id);
  if (!room) return res.status(404).json({ error: 'Session not found' });
  res.json({ id: room.id, name: room.name, participants: room.participants.size });
});

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

// Join links look like /788065 — serve the app so the client can auto-join.
app.get(/^\/\d{4,8}$/, (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

// ── Real-time multiplayer (socket.io) ─────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  let roomId = null;

  const sync = () => {
    const room = session.getRoom(roomId);
    if (room) io.to(roomId).emit('room-update', session.publicState(room));
  };
  const joinRoom = (room, name, isObserver) => {
    roomId = room.id;
    socket.join(roomId);
    session.addParticipant(room, socket.id, name, isObserver);
    socket.emit('joined', { selfId: socket.id, room: session.publicState(room) });
    sync();
  };

  socket.on('create-session', ({ name, sessionName, scale, isObserver } = {}) => {
    const room = session.createRoom({ sessionName, scale });
    joinRoom(room, name, isObserver);
  });

  socket.on('join-session', ({ id, name, isObserver } = {}) => {
    const room = session.getRoom(id);
    if (!room) { socket.emit('join-error', { message: `Session ${id || ''} not found` }); return; }
    joinRoom(room, name, isObserver);
  });

  socket.on('cast-vote', ({ vote } = {}) => {
    const room = session.getRoom(roomId);
    if (room) { session.castVote(room, socket.id, vote); sync(); }
  });

  socket.on('reveal', () => { const r = session.getRoom(roomId); if (r) { session.reveal(r); sync(); } });
  socket.on('reset', () => { const r = session.getRoom(roomId); if (r) { session.resetVotes(r); sync(); } });
  socket.on('set-story', ({ story } = {}) => { const r = session.getRoom(roomId); if (r) { session.setStory(r, story); sync(); } });
  socket.on('set-observer', ({ isObserver } = {}) => { const r = session.getRoom(roomId); if (r) { session.setObserver(r, socket.id, isObserver); sync(); } });

  socket.on('leave', () => {
    const r = session.getRoom(roomId);
    if (r) { session.removeParticipant(r, socket.id); socket.leave(roomId); sync(); roomId = null; }
  });

  socket.on('disconnect', () => {
    const r = session.getRoom(roomId);
    if (r) { session.removeParticipant(r, socket.id); sync(); }
  });
});

// On Vercel the app runs as a stateless serverless function — socket.io rooms
// need a persistent process, so multiplayer is only active when run as a server.
if (process.env.VERCEL) {
  module.exports = app;
} else {
  server.listen(PORT, () => {
    const ai = process.env.ANTHROPIC_API_KEY
      ? (process.env.ANTHROPIC_API_KEY === 'MOCK' ? 'mock mode' : 'live')
      : 'unavailable (no key)';
    console.log(`Planning Poker → http://localhost:${PORT}`);
    console.log(`Jira URL : ${process.env.JIRA_URL || '(not set — configure via UI)'}`);
    console.log(`AI status: ${ai}`);
    console.log(`Multiplayer: socket.io ready`);
  });
}
