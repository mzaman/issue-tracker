'use strict';

require('dotenv').config();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const errorHandler = require('./src/middleware/errorHandler');
const { jwtMiddleware, clientIdMiddleware } = require('./src/middleware/auth');
const config = require('./config');

// Import centralized routes with versioning support
const apiRouter = require('./src/routes');

const app = new Koa();

// Middlewares
app.use(bodyParser());
app.use(errorHandler);
app.use(clientIdMiddleware);
app.use(jwtMiddleware);

// Mount routes (with versioning prefix /api/v1)
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// Export app for testing
module.exports = app;

// Start server if run directly
if (!module.parent) {
  app.listen(config.port, () => {
    console.log(`Server listening on http://localhost:${config.port}/api/v1`);
  });
}
