const router = require('express').Router();
const ai = require('../services/aiService');

function handle(fn) {
  return async (req, res) => {
    try {
      res.json(await fn(req));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  };
}

router.get('/status', (req, res) => res.json(ai.getStatus()));

router.post('/estimate', handle(req => {
  const { story, referenceStories = [], githubContext = '' } = req.body;
  if (!story) throw new Error('story is required');
  return ai.getEstimate(story, referenceStories, githubContext);
}));

router.post('/scrummaster', handle(req => {
  const { story, votes, median } = req.body;
  if (!story || !votes) throw new Error('story and votes are required');
  return ai.getScrumMasterQuestions(story, votes, median);
}));

router.post('/followup', handle(req => {
  const { story, conversation } = req.body;
  if (!story || !conversation) throw new Error('story and conversation are required');
  return ai.getFollowup(story, conversation);
}));

module.exports = router;
