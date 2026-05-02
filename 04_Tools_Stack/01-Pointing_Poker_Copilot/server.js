require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/jira', require('./routes/jira'));
app.use('/api/ai', require('./routes/ai'));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

app.listen(PORT, () => {
  const ai = process.env.ANTHROPIC_API_KEY
    ? (process.env.ANTHROPIC_API_KEY === 'MOCK' ? 'mock mode' : 'live')
    : 'unavailable (no key)';
  console.log(`Planning Poker → http://localhost:${PORT}`);
  console.log(`Jira URL : ${process.env.JIRA_URL || '(not set — configure via UI)'}`);
  console.log(`AI status: ${ai}`);
});
