'use strict';

const respond = require('../../utils/responses');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'supersecretkey123';
const tokenExpiry = process.env.JWT_EXPIRES_IN || '2h';

const Auth = {};

Auth.login = async (ctx) => {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
        return respond.badRequest(ctx, [
            { field: 'email', message: 'Email is required', code: 'missing_email' },
            { field: 'password', message: 'Password is required', code: 'missing_password' },
        ], 'Email and password are required');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return respond.unauthorized(ctx, 'Invalid email or password');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
        return respond.unauthorized(ctx, 'Invalid email or password');
    }

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, secret, { expiresIn: tokenExpiry });

    return respond.success(ctx, {
        token,
        expiresIn: tokenExpiry,
        user: { id: user.id, name: user.name, email: user.email },
    });
};

module.exports = Auth;