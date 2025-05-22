// middleware/auth.js
'use strict';

const jwt = require('koa-jwt');
const secret = process.env.JWT_SECRET || 'supersecretkey123';

const jwtMiddleware = jwt({ secret }).unless({
    path: ['/', '/health', '/login']  // add /login to public
});

const clientIdMiddleware = async (ctx, next) => {
    const clientId = ctx.headers['x-client-id'];
    if (!clientId) {
        ctx.status = 400;
        ctx.body = { message: 'Missing X-Client-ID header' };
        return;
    }
    if (clientId !== process.env.VALID_CLIENT_ID) {
        ctx.status = 403;
        ctx.body = { message: 'Invalid X-Client-ID' };
        return;
    }
    await next();
};

module.exports = {
    jwtMiddleware,
    clientIdMiddleware
};