'use strict';

const respond = require('../utils/responses');
const jwt = require('koa-jwt');

const secret = process.env.JWT_SECRET || 'supersecretkey123';

const jwtMiddleware = jwt({ secret }).unless({
    path: ['/', '/health', '/api/v1/auth/login', '/api/v2/auth/login'], // public paths
});

const clientIdMiddleware = async (ctx, next) => {
    const clientId = ctx.headers['x-client-id'];

    if (!clientId) {
        return respond.badRequest(
            ctx,
            [{ field: 'x-client-id', message: 'X-Client-ID header is required', code: 'missing_client_id' }],
            'Missing X-Client-ID header'
        );
    }

    if (clientId !== process.env.VALID_CLIENT_ID) {
        return respond.forbidden(
            ctx,
            'Invalid X-Client-ID'
        );
    }

    await next();
};

module.exports = {
    jwtMiddleware,
    clientIdMiddleware,
};