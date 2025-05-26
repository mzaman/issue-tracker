'use strict';

const respond = require('../utils/responses');
const jwt = require('koa-jwt');
const fs = require('fs');
const path = require('path');

// Load JWT secret
const secret = process.env.JWT_SECRET || 'supersecretkey123';
const { apiPrefix = '/api' } = require('../../config');

// Get API versions from routes folder (e.g., v1, v2, etc.)
const versionsPath = path.resolve(__dirname, '../routes');
const versions = fs.readdirSync(versionsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

// Base paths that should be supported across all version/prefix patterns
const basePublicRoutes = ['/', '/health', '/auth/login'];

// Collect all combinations
const publicPaths = new Set();

basePublicRoutes.forEach(route => {
    // No prefix
    publicPaths.add(route);

    // /api
    publicPaths.add(`${apiPrefix}${route}`);

    // /v1, /v2
    versions.forEach(version => {
        publicPaths.add(`/${version}${route}`);
        publicPaths.add(`${apiPrefix}/${version}${route}`);
    });
});

// JWT middleware with dynamic public paths
const jwtMiddleware = jwt({ secret }).unless({
    path: Array.from(publicPaths)
});

// Middleware to validate X-Client-ID header
const clientIdMiddleware = async (ctx, next) => {
    const clientId = ctx.headers['x-client-id'];

    if (!clientId) {
        return respond.badRequest(
            ctx,
            [{
                field: 'x-client-id',
                message: 'X-Client-ID header is required',
                code: 'missing_client_id'
            }],
            'Missing X-Client-ID header'
        );
    }

    if (clientId !== process.env.VALID_CLIENT_ID) {
        return respond.forbidden(ctx, 'Invalid X-Client-ID');
    }

    await next();
};

module.exports = {
    jwtMiddleware,
    clientIdMiddleware,
};