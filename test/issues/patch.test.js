const { generateFakeIssueData, buildEndpoints } = require('../utils');
const { createUserAndLogin } = require('../utils');
const { xClientIdTest } = require('../utils/commonTests');

describe('Update Issue', () => {
    let token, issueId;
    const updatedData = { title: 'Updated title' };
    const endpoints = buildEndpoints('issues');

    beforeAll(async () => {
        token = await createUserAndLogin();
        const res = await global.apiWithToken(token)
            .sendJson(generateFakeIssueData())
            .post('/api/v1/issues');

        issueId = res.body.data.id;
    });

    test.each(endpoints)('PATCH %s/:id', async (basePath) => {
        const res = await global.apiWithToken(token)
            .sendJson(updatedData)
            .patch(`${basePath}/${issueId}`);

        expect(res.statusCode).toBe(200);
    });

    endpoints.forEach((endpoint) => {
        xClientIdTest(`${endpoint}/${issueId}`, 'patch', updatedData);
    });
});