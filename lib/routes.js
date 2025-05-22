'use strict';

const Router = require('koa-router');
const router = new Router();

router.get('/', require('./api/discovery'));
router.get('/health', require('./api/health'));

// Issue routes
router.get('/issues/:id', require('./api/issues').get);
router.post('/issues', require('./api/issues').create);

module.exports = router;