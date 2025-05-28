
const { buildEndpoints } = require('../utils/index');
const { xClientIdTest } = require('../utils/commonTests');

describe('Health Endpoints', () => {
    const endpoints = buildEndpoints('/health');

    test.each(endpoints)('GET %s returns 200 and status', async (endpoint) => {
        const res = await global.api.get(endpoint);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            success: true,
            message: 'Request succeeded',
            data: {
                message: 'OK',
                version: expect.any(String),
            },
            errors: null,
        });
    });

    endpoints.forEach((endpoint) => {
        xClientIdTest(endpoint, 'get');
    });
});