const { faker } = require('@faker-js/faker');

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
    loginUser,
    getAuthHeader,
    faker,
    generateFakeIssueData,
};