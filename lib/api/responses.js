'use strict';

const DEFAULT_ERROR_TYPE = 'about:blank';

module.exports = {
    success: (context, data, meta = null) => {
        if (data === undefined || data === null) {
            context.status = 204;
            context.body = null;
        } else {
            context.status = 200;
            context.body = {
                success: true,
                message: 'Request succeeded',
                data,
                ...(meta && { meta }),
                errors: null,
            };
        }
    },

    created: (context, data, location = null) => {
        context.status = 201;
        if (location) context.set('Location', location);
        context.body = {
            success: true,
            message: 'Resource created successfully',
            data,
            errors: null,
        };
    },

    noContent: (context) => {
        context.status = 204;
        context.body = null;
    },

    badRequest: (context, errors = [], message = 'Bad Request', type = DEFAULT_ERROR_TYPE) => {
        context.status = 400;
        context.body = {
            type,
            title: message,
            status: 400,
            detail: message,
            instance: context.request?.url || '',
            errors: Array.isArray(errors) ? errors : [errors],
            success: false,
        };
    },

    unauthorized: (context, message = 'Authentication required or failed', type = DEFAULT_ERROR_TYPE) => {
        context.status = 401;
        context.body = {
            type,
            title: message,
            status: 401,
            detail: message,
            instance: context.request?.url || '',
            errors: null,
            success: false,
        };
    },

    // New method for expired token
    tokenExpired: (context, message = 'Token expired. Please login again.', type = 'token-expired') => {
        context.status = 401;
        context.body = {
            type,
            title: message,
            status: 401,
            detail: message,
            instance: context.request?.url || '',
            errors: null,
            success: false,
        };
    },

    // New method for invalid token
    invalidToken: (context, message = 'Invalid token. Authentication failed.', type = 'invalid-token') => {
        context.status = 401;
        context.body = {
            type,
            title: message,
            status: 401,
            detail: message,
            instance: context.request?.url || '',
            errors: null,
            success: false,
        };
    },

    forbidden: (context, message = 'Forbidden: Access denied', type = DEFAULT_ERROR_TYPE) => {
        context.status = 403;
        context.body = {
            type,
            title: message,
            status: 403,
            detail: message,
            instance: context.request?.url || '',
            errors: null,
            success: false,
        };
    },

    notFound: (context, message = 'Resource not found', type = DEFAULT_ERROR_TYPE) => {
        context.status = 404;
        context.body = {
            type,
            title: message,
            status: 404,
            detail: message,
            instance: context.request?.url || '',
            errors: null,
            success: false,
        };
    },

    conflict: (context, message = 'Conflict occurred', type = DEFAULT_ERROR_TYPE) => {
        context.status = 409;
        context.body = {
            type,
            title: message,
            status: 409,
            detail: message,
            instance: context.request?.url || '',
            errors: null,
            success: false,
        };
    },

    unprocessable: (context, errors = [], message = 'Unprocessable Entity', type = DEFAULT_ERROR_TYPE) => {
        context.status = 422;
        context.body = {
            type,
            title: message,
            status: 422,
            detail: message,
            instance: context.request?.url || '',
            errors: Array.isArray(errors) ? errors : [errors],
            success: false,
        };
    },

    internalError: (context, message = 'Internal server error', type = DEFAULT_ERROR_TYPE) => {
        context.status = 500;
        context.body = {
            type,
            title: message,
            status: 500,
            detail: message,
            instance: context.request?.url || '',
            errors: null,
            success: false,
        };
    },

    validationFailed: (context, errors = [], message = 'Validation failed', type = DEFAULT_ERROR_TYPE) => {
        return module.exports.unprocessable(context, errors, message, type);
    },
};