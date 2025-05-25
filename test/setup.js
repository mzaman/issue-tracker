// test/setup.js
const { sequelize } = require('../src/models/connection');
const request = require('supertest');
const { app } = require('../index.js');

// Extend Jest expect with additional matchers from jest-extended
require('jest-extended');

// Set environment variable for test environment
process.env.NODE_ENV = 'test';
global.testContext = {};

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