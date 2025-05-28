const { generateFakeIssueData, buildEndpoints } = require('../utils');
const { createUserAndLogin } = require('../utils');
const { xClientIdTest } = require('../utils/commonTests');
const request = require('supertest');

describe('Get Issue by ID', () => {
    let token, issueId;
    const endpoints = buildEndpoints('issues');

    beforeAll(async () => {
        token = await createUserAndLogin();
        const issueData = generateFakeIssueData();

        const res = await global.apiWithToken(token)
            .sendJson(issueData)
            .post('/api/v1/issues');

        if (res.statusCode !== 201) {
            console.error('Failed to create issue. Response:', res.body);
            throw new Error(`Failed to create issue. Status: ${res.statusCode}`);
        }

        issueId = res.body.data.id;
        // console.log('Issue created:', res.body);
    });

    test.each(endpoints)('GET %s/:id', async (basePath) => {
        console.log('issueId:', issueId);
        const res = await global.apiWithToken(token).get(`${basePath}/${issueId}`);
        console.log('res.body:', res.body);

        expect(res.statusCode).toBe(200);

        // Instead of checking for .id, check other fields to confirm correct issue returned
        expect(res.body.data).toHaveProperty('title');
        expect(res.body.data).toHaveProperty('description');
        expect(res.body.data.status).toBe('open'); // or whatever expected default/status
        expect(res.body.data.priority).toBe('medium'); // example

        // Optionally check createdBy and updatedBy emails if stable
        // expect(res.body.data.createdBy).toHaveProperty('email');
    });

    endpoints.forEach((endpoint) => {
        xClientIdTest(`${endpoint}/${issueId}`, 'get');
    });
});