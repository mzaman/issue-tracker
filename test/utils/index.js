const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const User = require('../../src/models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Normalizes a URL path by replacing multiple consecutive slashes (//) with a single slash (/).
 * Example: '/api//v1//health' becomes '/api/v1/health'
 *
 * @param {string} path - The raw endpoint path that may include double slashes
 * @returns {string} - A cleaned version of the endpoint path
 */
const normalizeEndpoint = (path) => path.replace(/\/{2,}/g, '/');

/**
 * Build all valid route variants combining prefixes and versions
 *
 * @param {string} endpoint - The route path (e.g. 'auth/login')
 * @param {string[]} [prefixes=['', 'api']] - Top-level prefixes (e.g. '', 'api')
 * @param {string[]} [versions=['v1', 'v2']] - Versions (e.g. '', 'v1', 'v2')
 * @returns {string[]} Array of endpoint variants (e.g. ['/auth/login', '/api/v1/auth/login', ...])
 */
const buildEndpoints = (
    endpoint,
    prefixes = ['', 'api'],
    versions = ['v1', 'v2']
) => {
    // Helper: normalize paths by replacing multiple slashes with single slash
    const normalize = (path) => path.replace(/\/{2,}/g, '/');

    // Generate all combinations of prefix/version/endpoint
    return prefixes.flatMap((prefix) =>
        versions.map((version) =>
            // Build path parts array, skip empty strings to avoid extra slashes
            normalize(
                ['/', prefix, version, endpoint]
                    .filter(Boolean) // remove empty strings
                    .join('/')
            )
        )
    );
};

/**
 * Logs in user and returns JWT token
 * @param {string} version - API version e.g., 'v1'
 * @param {string} email
 * @param {string} password
 * @returns {Promise<string>} JWT token
 */
const loginUser = async (version = 'v1', email = 'admin@example.com', password = 'Password123') => {
    if (!global.testContext?.request) {
        throw new Error('Supertest request object not initialized.');
    }

    const res = await global.testContext.request
        .post(`/api/${version}/auth/login`)
        .send({ email, password });

    if (res.status !== 200) {
        throw new Error('Login failed');
    }

    return res.body.token;
};

const createUserAndLogin = async () => {
    const payload = {
        email: faker.internet.email(),
        password: 'Password123',
    };

    const endpoint = 'api/v1/auth/login';

    const passwordHash = await bcrypt.hash(payload.password, 10);

    await User.findOrCreate({
        where: { email: payload.email },
        defaults: {
            name: faker.person.fullName(),
            passwordHash,
        },
    });

    const res = await global.api
        .sendJson(payload)
        .post(endpoint);

    // console.log('Login response body:', res.body);
    return res.body.data.token;
};

/**
 * Returns Authorization header object for given token
 * @param {string} token JWT token
 */
const getAuthHeader = (token) => ({
    Authorization: `Bearer ${token}`,
});

/**
 * Generates fake issue data for testing
 */
const generateFakeIssueData = () => ({
    title: faker.lorem.sentence(5),
    description: faker.lorem.paragraph(),
    priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
    status: 'open',
    assignee: null,
});

module.exports = {
    normalizeEndpoint,
    buildEndpoints,
    loginUser,
    getAuthHeader,
    faker,
    generateFakeIssueData,
    createUserAndLogin,
};