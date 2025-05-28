const { buildEndpoints } = require('./utils');
const { xClientIdTest } = require('./utils/commonTests');

describe('Root API Endpoint', () => {
    const clientIDHeader = { 'X-Client-ID': 'my-client-id-123' };

    test('GET / returns API metadata', async () => {
        const res = await global.rawApi
            .get('/')
            .set('accept', 'application/json')
            .set(clientIDHeader);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            success: true,
            message: 'Request succeeded',
            data: {
                discovery: expect.stringMatching(/^http:\/\/localhost:\d+$/),
            },
            errors: null,
        });
    });
});


describe('Client ID Test', () => {
    const endpoints = buildEndpoints('/');

    test.each(endpoints)('GET / returns API metadata', async (endpoint) => {
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