const express = require('express');
const router = express.Router();
const multer = require('multer');
const transcribeService = require('../services/transcribeService');
const aiService = require('../services/aiService');
const notionService = require('../services/notionService');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// POST /api/voice/upload — audio file → Whisper → Claude → Notion
// Only active when USE_WHISPER=true
router.post('/upload', upload.single('audio'), async (req, res) => {
  if (process.env.USE_WHISPER !== 'true') {
    return res.status(400).json({
      error: 'Whisper upload disabled. Set USE_WHISPER=true in .env or use browser SpeechRecognition.',
    });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  try {
    const transcription = await transcribeService.transcribe(req.file.buffer, req.file.mimetype);
    const { actionItems, summary } = await aiService.extractActionItems(transcription);
    const createdItems =
      actionItems.length > 0
        ? await notionService.createItems(actionItems, transcription)
        : [];

    res.json({ transcription, actionItems: createdItems, summary });
  } catch (err) {
    console.error('Voice upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
