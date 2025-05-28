'use strict';

const bcrypt = require('bcrypt');
const User = require('../src/models/user');
const { buildEndpoints } = require('./utils');


describe('Login Endpoint Variants', () => {
    const loginPayload = {
        email: 'user-1@example.com',
        password: 'Password123',
    };

    const endpoints = buildEndpoints('auth/login');

    beforeEach(async () => {
        await User.destroy({ where: { email: loginPayload.email } });

        const passwordHash = await bcrypt.hash(loginPayload.password, 10);
        await User.create({
            email: loginPayload.email,
            name: 'User One',
            passwordHash,
        });
    });

    test.each(endpoints)('POST %s → returns token and user info', async (endpoint) => {
        const res = await api
            .sendJson(loginPayload)
            .expectStatus(200)
            .post(endpoint);

        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data.user.email).toBe(loginPayload.email);
    });
});