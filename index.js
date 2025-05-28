// ./index.js
'use strict';

require('dotenv').config();
const Koa = require('koa');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');

const errorHandler = require('./src/middleware/errorHandler');
const { jwtMiddleware, clientIdMiddleware } = require('./src/middleware/auth');
const config = require('./config');
const apiRouter = require('./src/routes');

const app = new Koa();

// Enable CORS for API documentation
const corsOptions = {
  origin: config.apiDocUrl,
  allowHeaders: ['Content-Type', 'Authorization', 'X-Client-ID'],
  exposeHeaders: ['X-Client-ID'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

if (process.env.NODE_ENV !== 'production') {
  app.use(cors(corsOptions));
}


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
} else {
  // For tests: start the server lazily
  server = null;
}

// Export app for testing (not server) and for use in other modules
module.exports = { app, server, getServer: () => server || app.listen() };