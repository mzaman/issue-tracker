describe('Health Check API', () => {
    test('GET /api/v1/health returns service status', async () => {
        const res = await global.api.get('/api/v1/health');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            success: true,
            message: 'Request succeeded',
            data: {
                message: 'OK',
                version: expect.any(String), // Or explicitly: '1.0.0'
            },
            errors: null,
        });

        // Optional additional checks:
        expect(res.body.data.message).toBe('OK');
        expect(res.body.data.version).toMatch(/^\d+\.\d+\.\d+$/); // e.g., "1.0.0"
    });
});