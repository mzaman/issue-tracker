'use strict';

const Router = require('koa-router');
const router = new Router();

router.get('/', require('./api/discovery'));
router.get('/health', require('./api/health'));

// Issue routes
router.get('/issues', require('./api/issues').list);
router.get('/issues/:id', require('./api/issues').get);
router.post('/issues', require('./api/issues').create);
router.put('/issues/:id', require('./api/issues').update);

module.exports = router;