'use strict';

require('dotenv').config();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const { jwtMiddleware, clientIdMiddleware } = require('./middleware/auth');
const router = require('./lib/routes');
const config = require('./config');

const app = new Koa();

app.use(bodyParser());
app.use(clientIdMiddleware);
app.use(jwtMiddleware);

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(config.port);
console.log(`Listening on http://localhost:${config.port}`);