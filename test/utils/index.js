const { faker } = require('@faker-js/faker');

/**
 * Build all valid route variants combining prefixes and versions
 *
 * @param {string} endpoint - The route path (e.g. 'auth/login')
 * @param {string[]} [prefixes=['', 'api']] - Top-level prefixes (e.g. '', 'api')
 * @param {string[]} [versions=['v1', 'v2']] - Versions (e.g. '', 'v1', 'v2')
 * @returns {string[]} Array of endpoint variants (e.g. ['/auth/login', '/api/v1/auth/login', ...])
 */
const buildEndpoints = (endpoint, prefixes = ['', 'api'], versions = ['v1', 'v2']) => {
    const variants = [];

    for (const prefix of prefixes) {
        for (const version of ['', ...versions]) {
            const parts = [prefix, version, endpoint].filter(Boolean);
            const path = '/' + parts.join('/');
            variants.push(path);
        }
    }

    return [...new Set(variants)];
}

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
    buildEndpoints,
    loginUser,
    getAuthHeader,
    faker,
    generateFakeIssueData,
};