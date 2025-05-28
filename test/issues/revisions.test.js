const { generateFakeIssueData, buildEndpoints } = require('../utils');
const { createUserAndLogin } = require('../utils');
const { xClientIdTest } = require('../utils/commonTests');

describe('Issue Revisions', () => {
    let token, issueId;
    const endpoints = buildEndpoints('issues');

    beforeAll(async () => {
        token = await createUserAndLogin();
        const res = await global.apiWithToken(token)
            .post('/api/v1/issues')
            .send(generateFakeIssueData());
        issueId = res.body.id;

        await global.apiWithToken(token)
            .put(`/api/v1/issues/${issueId}`)
            .send({ title: 'Update for revision' });
    });

    test.each(endpoints)('GET %s/:id/revisions', async (basePath) => {
        const res = await global.apiWithToken(token)
            .get(`${basePath}/${issueId}/revisions`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test.each(endpoints)('GET %s/:id/revisions/compare', async (basePath) => {
        const revRes = await global.apiWithToken(token)
            .get(`${basePath}/${issueId}/revisions`);
        if (revRes.body.length >= 2) {
            const from = revRes.body[0].revisionNumber;
            const to = revRes.body[revRes.body.length - 1].revisionNumber;

            const cmpRes = await global.apiWithToken(token)
                .get(`${basePath}/${issueId}/revisions/compare?from=${from}&to=${to}`);
            expect(cmpRes.statusCode).toBe(200);
        }
    });

    endpoints.forEach((endpoint) => {
        xClientIdTest(`${endpoint}/${issueId}/revisions`, 'get');
        xClientIdTest(`${endpoint}/${issueId}/revisions/compare?from=1&to=2`, 'get');
    });
});