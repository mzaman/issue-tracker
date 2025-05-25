describe('Discovery Endpoints', () => {

    test('GET / returns 200 and discovery info', async () => {
        const res = await global.testContext.request.get('/');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('version');
    });
});