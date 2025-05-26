// test/setup.js
const sequelize = require('../src/models/connection');
const request = require('supertest');
const { app } = require('../index.js');

// Extend Jest expect with additional matchers from jest-extended
require('jest-extended');

// Set environment variable for test environment
process.env.NODE_ENV = 'test';
const validClientId = process.env.VALID_CLIENT_ID || 'test-client-id';

// Create a wrapped supertest instance that includes X-Client-ID for all HTTP methods
const baseRequest = request(app.listen());

global.testContext = {
    request: {
        get: (url) => baseRequest.get(url).set('X-Client-ID', validClientId),
        post: (url) => baseRequest.post(url).set('X-Client-ID', validClientId),
        put: (url) => baseRequest.put(url).set('X-Client-ID', validClientId),
        patch: (url) => baseRequest.patch(url).set('X-Client-ID', validClientId),
        delete: (url) => baseRequest.delete(url).set('X-Client-ID', validClientId),
    },
};

let server;
beforeAll(async () => {
    // Recreate DB schema
    await sequelize.sync({ force: true });

    // Start server on random port
    const server = app.listen();

    // Store server and Supertest instance globally
    global.testContext.request = request(server);
    global.testContext.server = server;
});

afterAll(async () => {
    // Close the DB connection and server after all tests complete
    await sequelize.close();
    if (server) server.close();
});

// module.exports = {
//     request: () => request(server), // Helper to use in your tests
// };