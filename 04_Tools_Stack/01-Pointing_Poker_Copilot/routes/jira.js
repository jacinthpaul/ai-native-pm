const router = require('express').Router();
const jira = require('../services/jiraService');

function cfg(req) {
  return {
    url: req.headers['x-jira-url'] || undefined,
    email: req.headers['x-jira-email'] || undefined,
    token: req.headers['x-jira-token'] || undefined,
    storyPointsField: req.headers['x-story-points-field'] || undefined,
  };
}

function handle(fn) {
  return async (req, res) => {
    try {
      const result = await fn(req, res);
      res.json(result);
    } catch (e) {
      const status = e.message.startsWith('Jira 401') ? 401
        : e.message.startsWith('Jira 403') ? 403
        : e.message.includes('credentials not configured') ? 400
        : 500;
      res.status(status).json({ error: e.message });
    }
  };
}

router.get('/test', handle(req => jira.testConnection(cfg(req))));

router.get('/boards', handle(req => jira.getBoards(cfg(req)).then(boards => ({ boards }))));

router.get('/boards/:boardId/sprints', handle(req =>
  jira.getSprints(req.params.boardId, req.query.state || 'active,future', cfg(req))
    .then(sprints => ({ sprints }))
));

router.get('/boards/:boardId/backlog', handle(req =>
  jira.getBacklogIssues(req.params.boardId, cfg(req)).then(issues => ({ issues }))
));

router.get('/boards/:boardId/team', handle(req =>
  jira.getTeamMembers(req.params.boardId, cfg(req)).then(members => ({ members }))
));

router.get('/boards/:boardId/reference-stories', handle(req =>
  jira.getReferenceStories(req.params.boardId, cfg(req)).then(stories => ({ stories }))
));

router.get('/sprints/:sprintId/issues', handle(req =>
  jira.getSprintIssues(req.params.sprintId, cfg(req)).then(issues => ({ issues }))
));

router.put('/issues/:issueKey/storypoints', handle(async req => {
  const { points } = req.body;
  if (points === undefined || points === null) throw new Error('points is required');
  return jira.updateStoryPoints(req.params.issueKey, Number(points), cfg(req));
}));

router.get('/issues/:issueKey/epic', handle(req =>
  jira.getEpicContext(req.params.issueKey, cfg(req)).then(epic => ({ epic }))
));

module.exports = router;
