// test/discovery.test.js

describe('Discovery Endpoints', () => {
    test('GET / returns 200 and discovery info', async () => {
        const res = await global.testContext.request.get('/');

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            success: true,
            data: {
                discovery: expect.stringContaining('http'),
            },
            errors: null,
        });
    });
});