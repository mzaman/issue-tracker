const { faker } = require('@faker-js/faker');
const { createUserAndLogin, buildEndpoints } = require('../utils');
const { xClientIdTest } = require('../utils/commonTests');

describe('Create Issue - Validation and Edge Cases', () => {
    const endpoints = buildEndpoints('issues');

    let token;
    beforeAll(async () => {
        token = await createUserAndLogin();
    });

    test.each(endpoints)('POST %s - missing required fields', async (url) => {
        const payload = { title: '', description: '' }; // invalid: title and description required

        const res = await global.apiWithToken(token)
            .sendJson(payload)
            .post(url);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.stringContaining('"title" is not allowed to be empty'),
                expect.stringContaining('"description" is not allowed to be empty'),
            ])
        );
    });

    test.each(endpoints)('POST %s - duplicate issue returns conflict', async (url) => {
        const payload = {
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            status: 'open',
            priority: 'medium',
            assignee: null,
        };

        // Create first time
        const firstRes = await global.apiWithToken(token)
            .sendJson(payload)
            .post(url);

        expect(firstRes.statusCode).toBe(201);

        // Try to create duplicate
        const dupRes = await global.apiWithToken(token)
            .sendJson(payload)
            .post(url);

        expect(dupRes.statusCode).toBe(409);
        expect(dupRes.body).toHaveProperty('title');
        expect(dupRes.body.title).toBe('Issue already exists');
        // expect(dupRes.body).toHaveProperty('error', 'Issue already exists');
    });

    test.each(endpoints)('POST %s - invalid assignee returns bad request', async (url) => {
        const payload = {
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            assignee: 9999999, // assuming this user ID does not exist
        };

        const res = await global.apiWithToken(token)
            .sendJson(payload)
            .post(url);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0]).toMatch(/Assignee with ID \d+ does not exist/);
    });

    // Also run the common xClientIdTest for these endpoints
    endpoints.forEach((endpoint) => {
        xClientIdTest(endpoint, 'post', {
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
        });
    });
});