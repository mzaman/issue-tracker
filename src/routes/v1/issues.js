const Router = require('koa-router');
const IssuesController = require('../../controllers/v1/issues');

const router = new Router();

// RESTful issue routes
router.get('/', IssuesController.list);
router.get('/:id', IssuesController.get);
router.post('/', IssuesController.create);
router.patch('/:id', IssuesController.patch);
// router.delete('/:id', IssuesController.delete);

// Issue revisions endpoints
router.get('/:id/revisions', IssuesController.revisions);
router.get('/:id/revisions/compare', IssuesController.compareRevisions);

module.exports = router;