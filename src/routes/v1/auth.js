const Router = require('koa-router');
const AuthController = require('../../controllers/v1/auth');

const router = new Router();

// Auth routes
router.post('/login', AuthController.login);

module.exports = router;