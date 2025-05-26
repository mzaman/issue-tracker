// ./index.js
'use strict';

require('dotenv').config();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const errorHandler = require('./src/middleware/errorHandler');
const { jwtMiddleware, clientIdMiddleware } = require('./src/middleware/auth');
const config = require('./config');
const apiRouter = require('./src/routes');

const app = new Koa();

// Middleware setup
app.use(bodyParser());
app.use(errorHandler);
app.use(clientIdMiddleware);
app.use(jwtMiddleware);

// Routes
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());


let server;

// Start server only if run directly (e.g. `node index.js`)
if (!module.parent) {
  server = app.listen(config.port, () => {
    console.log(`Server listening on http://localhost:${config.port}/api/v1`);
  });
}

// Export app for testing (not server)
module.exports = { app, server };