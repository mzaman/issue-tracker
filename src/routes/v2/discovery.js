const Router = require('koa-router');
const discoveryController = require('../../controllers/v2/discovery');

const router = new Router();

// Map GET /  => discovery controller
router.get('/', discoveryController);

module.exports = router;