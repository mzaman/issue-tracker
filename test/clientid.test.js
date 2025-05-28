describe('Root API Endpoint', () => {
    const clientIDHeader = { 'x-client-id': 'my-client-id-123' };

    test('GET / returns API metadata', async () => {
        const res = await global.testContext.request
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