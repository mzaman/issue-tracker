const sinon = require('sinon');
const { expect } = require('expect');
const proxyquire = require('proxyquire').noCallThru();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth Controller - login', () => {
    let UserMock, Auth, ctx;

    beforeEach(() => {
        UserMock = {
            findOne: sinon.stub(),
        };

        // Proxyquire to inject User mock into auth controller
        Auth = proxyquire('../src/controllers/v1/auth', {
            '../models/user': UserMock,
            'bcryptjs': bcrypt,
            'jsonwebtoken': jwt,
        });

        ctx = {
            request: {
                body: {},
            },
            status: 0,
            body: null,
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    test('returns 400 if email or password missing', async () => {
        ctx.request.body = {};
        await Auth.login(ctx);
        expect(ctx.status).toBe(400);
        expect(ctx.body.message).toBe('Email and password are required');
    });

    test('returns 401 if user not found', async () => {
        ctx.request.body = { email: 'test@example.com', password: 'pass' };
        UserMock.findOne.resolves(null);

        await Auth.login(ctx);

        expect(ctx.status).toBe(401);
        expect(ctx.body.message).toBe('Invalid email or password');
    });

    test('returns 401 if password invalid', async () => {
        ctx.request.body = { email: 'test@example.com', password: 'pass' };
        UserMock.findOne.resolves({ password_hash: 'hashedPass' });

        sinon.stub(bcrypt, 'compare').resolves(false);

        await Auth.login(ctx);

        expect(ctx.status).toBe(401);
        expect(ctx.body.message).toBe('Invalid email or password');
    });

    test('returns token and user on successful login', async () => {
        ctx.request.body = { email: 'test@example.com', password: 'pass' };
        UserMock.findOne.resolves({ id: 1, email: 'test@example.com', password_hash: 'hashedPass' });

        sinon.stub(bcrypt, 'compare').resolves(true);
        sinon.stub(jwt, 'sign').returns('mockedToken');

        await Auth.login(ctx);

        expect(ctx.status).toBe(200);
        expect(ctx.body).toHaveProperty('token', 'mockedToken');
        expect(ctx.body.user).toMatchObject({ id: 1, email: 'test@example.com' });
    });
});