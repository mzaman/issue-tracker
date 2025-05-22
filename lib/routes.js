'use strict';

const Router = require('koa-router');
const router = new Router();

const Auth = require('./api/auth');
const Issues = require('./api/issues');

// Discovery routes (health check)
router.get('/', require('./api/discovery'));
router.get('/health', require('./api/health'));

// Auth routes
router.post('/login', Auth.login);

// Issue routes
router.get('/issues', Issues.list);
router.get('/issues/:id', Issues.get);
router.post('/issues', Issues.create);
router.put('/issues/:id', Issues.update);
router.get('/issues/:id/revisions', Issues.revisions);
router.get('/issues/:id/compare', Issues.compare);

module.exports = router;