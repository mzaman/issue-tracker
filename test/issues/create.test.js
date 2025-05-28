const { faker } = require('@faker-js/faker');
const { generateFakeIssueData, createUserAndLogin, buildEndpoints } = require('../utils');
const { xClientIdTest } = require('../utils/commonTests');

describe('Create Issue', () => {
    const endpoints = buildEndpoints('issues');

    test.each(endpoints)('POST %s', async (url) => {
        const token = await createUserAndLogin();
        const payload = generateFakeIssueData(); // generate new payload per test

        console.log('Creating issue at:', url);
        const res = await global.apiWithToken(token)
            .sendJson(payload)
            .post(url);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('data.id');
    });

    // This is fine to use the static payload here
    endpoints.forEach((endpoint) => {
        xClientIdTest(endpoint, 'post', generateFakeIssueData());
    });
});