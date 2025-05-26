// test/health.test.js

describe('Health Endpoints', () => {
    test('GET /health returns 200 and status', async () => {
        const res = await global.testContext.request.get('/health');

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
});