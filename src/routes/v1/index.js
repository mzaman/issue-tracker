// src/routes/v1/index.js

const Router = require('koa-router');
const issuesRoutes = require('./issues');
const authRoutes = require('./auth');
const discoveryRoutes = require('./discovery');
const healthRoutes = require('./health');

const router = new Router();

// Define routes
router.get('/test', ctx => {
    ctx.body = 'CORS test passed!';
});

// Mount resource routes for this version
router.use('/', discoveryRoutes.routes(), healthRoutes.allowedMethods());
router.use('/health', healthRoutes.routes(), healthRoutes.allowedMethods());
router.use('/auth', authRoutes.routes(), authRoutes.allowedMethods());
router.use('/issues', issuesRoutes.routes(), issuesRoutes.allowedMethods());

module.exports = router;