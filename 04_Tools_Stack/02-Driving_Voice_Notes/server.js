require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const notesRouter = require('./routes/notes');
const voiceRouter = require('./routes/voice');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/notes', notesRouter);
app.use('/api/voice', voiceRouter);

app.get('/api/config', (req, res) => {
  res.json({ notionLink: process.env.NOTION_LINK || '' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Driving Voice Notes running at http://localhost:${PORT}`);
});
