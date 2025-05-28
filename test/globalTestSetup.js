// test/globalTestSetup.js

const { app, server } = require('../index');
const sequelize = require('../src/models/connection');
const request = require('supertest');
const ApiBuilder = require('./utils/apiBuilder');
require('jest-extended');

// process.env.NODE_ENV = 'test'; // Moved to globalSetup.js

const DEFAULT_CLIENT_ID = process.env.VALID_CLIENT_ID || 'my-client-id-123';

beforeAll(async () => {
    await sequelize.sync({ force: true });

    if (!server || !server.listening) {
        global.server = app.listen();
    } else {
        global.server = server;
    }

    const raw = request(global.server);

    global.rawApi = raw;

    global.api = new ApiBuilder(raw, {
        'X-Client-ID': DEFAULT_CLIENT_ID,
    });

    global.apiWithToken = (token) =>
        new ApiBuilder(raw, {
            'X-Client-ID': DEFAULT_CLIENT_ID,
            Authorization: `Bearer ${token}`,
        });
});

afterAll(async () => {
    await sequelize.close();

    if (global.server && global.server.close) {
        await new Promise((resolve, reject) =>
            global.server.close((err) => (err ? reject(err) : resolve()))
        );
    }
});