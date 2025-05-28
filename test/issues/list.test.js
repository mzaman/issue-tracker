const { generateFakeIssueData, buildEndpoints } = require('../utils');
const { createUserAndLogin } = require('../utils');
const { xClientIdTest } = require('../utils/commonTests');

describe('List Issues', () => {
    let token;
    const endpoints = buildEndpoints('issues');

    beforeAll(async () => {
        token = await createUserAndLogin();
        await global.apiWithToken(token)
            .post('/api/v1/issues')
            .send(generateFakeIssueData());
    });

    test.each(endpoints)('GET %s', async (basePath) => {
        const res = await global.apiWithToken(token).get(basePath);
        expect(res.statusCode).toBe(200);
    });

    endpoints.forEach((endpoint) => {
        xClientIdTest(endpoint, 'get');
    });
});