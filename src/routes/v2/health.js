const Router = require('koa-router');
const HealthController = require('../../controllers/v2/health');

const router = new Router();

// Health check endpoint
router.get('/', HealthController);

module.exports = router;