
const { buildEndpoints } = require('../utils/index');
const { xClientIdTest } = require('../utils/commonTests');

describe('Discovery Endpoints', () => {
    const endpoints = buildEndpoints('/');

    test.each(endpoints)('GET %s returns 200 and discovery info', async (endpoint) => {
        const res = await global.api.get(endpoint);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            success: true,
            data: {
                discovery: expect.stringContaining('http'),
            },
            errors: null,
        });
    });

    // Apply X-Client-ID tests to all endpoints
    endpoints.forEach((endpoint) => {
        xClientIdTest(endpoint, 'get');
    });
});