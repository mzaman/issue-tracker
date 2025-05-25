// middleware/errorHandler.js
'use strict';

const respond = require('../utils/responses');
const jwt = require('jsonwebtoken');

module.exports = async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        if (err.status === 401) {
            // Customize messages based on JWT error type
            if (err.originalError && err.originalError.name === 'TokenExpiredError') {
                return respond.tokenExpired(ctx);
            }
            if (err.originalError && err.originalError.name === 'JsonWebTokenError') {
                return respond.invalidToken(ctx);
            }
            // fallback unauthorized
            return respond.unauthorized(ctx, err.message || 'Authentication required or failed');
        }

        // fallback generic error
        ctx.status = err.status || 500;
        ctx.body = {
            success: false,
            message: err.message || 'Internal server error',
            data: null,
            errors: null,
        };
    }
};