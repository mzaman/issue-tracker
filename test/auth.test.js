const { faker } = require('./utils');

describe('Auth API Tests', () => {
  test.each(['v1', 'v2'])('Successful login for API version %s', async (version) => {
    const res = await global.testContext.request.post(`/api/${version}/auth/login`).send({
      email: 'admin@example.com',
      password: 'Password123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.token).toBeString();
  });

  test.each(['v1', 'v2'])('Login fails with invalid credentials for %s', async (version) => {
    const res = await global.testContext.request.post(`/api/${version}/auth/login`).send({
      email: 'admin@example.com',
      password: faker.internet.password(),
    });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test.each(['v1', 'v2'])('Login fails with missing fields for %s', async (version) => {
    const res = await global.testContext.request.post(`/api/${version}/auth/login`).send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});