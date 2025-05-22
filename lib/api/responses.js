'use strict';

module.exports = {
    success: (context, data) => {
        context.status = data ? 200 : 204;
        context.body = data || null;
    },

    created: (context, data) => {
        context.status = 201;
        context.body = data;
    },

    noContent: (context) => {
        context.status = 204;
        context.body = null;
    },

    badRequest: (context, errors) => {
        context.status = 400;
        context.body = {
            message: 'Check your request parameters',
            errors: errors
        };
    },

    unauthorized: (context) => {
        context.status = 401;
        context.body = { message: 'Authentication required or failed' };
    },

    forbidden: (context) => {
        context.status = 403;
        context.body = { message: 'You do not have permission to access this resource' };
    },

    notFound: (context) => {
        context.status = 404;
        context.body = { message: 'Resource was not found' };
    },

    conflict: (context, message = 'Resource conflict') => {
        context.status = 409;
        context.body = { message };
    },

    unprocessable: (context, errors) => {
        context.status = 422;
        context.body = {
            message: 'Unprocessable entity',
            errors: errors
        };
    },

    internalError: (context, message = 'Internal server error') => {
        context.status = 500;
        context.body = { message };
    }
};