const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const notionService = require('../services/notionService');

// POST /api/notes/process — main pipeline: transcription text → Claude → Notion
router.post('/process', async (req, res) => {
  const { transcription } = req.body;
  if (!transcription || !transcription.trim()) {
    return res.status(400).json({ error: 'transcription is required' });
  }

  try {
    const { actionItems, summary } = await aiService.extractActionItems(transcription);

    if (actionItems.length === 0) {
      return res.json({ actionItems: [], summary, message: 'No actionable items found' });
    }

    const createdItems = await notionService.createItems(actionItems, transcription);
    res.json({ actionItems: createdItems, summary });
  } catch (err) {
    console.error('Process error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notes/today — count of today's items (shown in app header)
router.get('/today', async (req, res) => {
  try {
    const items = await notionService.getTodaysItems();
    res.json({ items, count: items.length });
  } catch (err) {
    console.error('Today fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
