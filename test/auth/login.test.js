'use strict';

const bcrypt = require('bcrypt');
const User = require('../../src/models/user');
const { faker, buildEndpoints } = require('../utils');
const { xClientIdTest } = require('../utils/commonTests');

describe('Auth Login API Tests', () => {
  const loginPayload = { email: 'user-2@example.com', password: 'Password123' };
  const endpoints = buildEndpoints('auth/login'); // Builds all route variants

  beforeEach(async () => {
    await User.destroy({ where: { email: loginPayload.email } });

    const passwordHash = await bcrypt.hash(loginPayload.password, 10);
    await User.create({
      email: loginPayload.email,
      name: 'User One',
      passwordHash,
    });
  });

  // Inject common header tests for each endpoint
  endpoints.forEach((endpoint) => {
    xClientIdTest(endpoint, 'post', loginPayload);
  });

  test.each(endpoints)('Successful login → %s', async (url) => {
    const res = await api
      .sendJson(loginPayload)
      .expectStatus(200)
      .post(url);

    expect(res.body).toHaveProperty('data.token');
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  test.each(endpoints)('Invalid credentials → %s', async (url) => {
    const res = await api
      .sendJson({ email: loginPayload.email, password: faker.internet.password() })
      .expectStatus(401)
      .post(url);

    expect(res.body).toHaveProperty('title');
    expect(res.body.title).toEqual('Invalid email or password');
  });

  test.each(endpoints)('Missing fields → %s', async (url) => {
    const res = await api
      .sendJson({})
      .expectStatus(400)
      .post(url);

    expect(res.body).toHaveProperty('title');
    expect(res.body.title).toEqual('Email and password are required');
  });
});