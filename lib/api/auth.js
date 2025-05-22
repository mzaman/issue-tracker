'use strict';

const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'supersecretkey123';
const tokenExpiry = process.env.JWT_EXPIRES_IN || '2h';

const Auth = {};

Auth.login = async (ctx) => {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
        ctx.status = 400;
        ctx.body = { message: 'Email and password are required' };
        return;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        ctx.status = 401;
        ctx.body = { message: 'Invalid email or password' };
        return;
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
        ctx.status = 401;
        ctx.body = { message: 'Invalid email or password' };
        return;
    }

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, secret, { expiresIn: tokenExpiry });

    ctx.body = {
        token,
        expiresIn: tokenExpiry,
        user: { id: user.id, email: user.email }
    };
};

module.exports = Auth;