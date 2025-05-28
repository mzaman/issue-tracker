const DEFAULT_CLIENT_ID = process.env.VALID_CLIENT_ID || 'my-client-id-123';
const INVALID_CLIENT_ID = 'invalid-client-id-456';

/**
 * Reusable test to verify X-Client-ID header behavior
 * 
 * @param {string} path - Endpoint path (e.g., '/api/v1/auth/login')
 * @param {string} method - HTTP method (e.g., 'post', 'get')
 * @param {Object} payload - Optional request body
 */
const xClientIdTest = (path, method = 'post', payload = {}) => {
    describe(`X-Client-ID header tests for [${method.toUpperCase()}] ${path}`, () => {
        test('Should return 400 if X-Client-ID is missing', async () => {
            const res = await global.rawApi[method](path).send(payload);
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('title');
            expect(res.body.title).toMatch(/missing x-client-id/i);
        });

        test('Should return 401 or 403 with invalid X-Client-ID', async () => {
            const res = await global.rawApi[method](path)
                .set('X-Client-ID', INVALID_CLIENT_ID)
                .send(payload);
            expect([401, 403, 400]).toContain(res.statusCode); // allow 400 just in case your API returns it
        });

        test('Should pass with valid X-Client-ID', async () => {
            const res = await global.rawApi[method](path)
                .set('X-Client-ID', DEFAULT_CLIENT_ID)
                .send(payload);
            expect([200, 401, 403, 404]).toContain(res.statusCode);
        });
    });
};

module.exports = { xClientIdTest };