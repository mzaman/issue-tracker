const { loginUser, getAuthHeader, generateFakeIssueData } = require('./utils');

describe('Issues API Tests', () => {
  const versions = ['v1', 'v2'];
  let tokens = {};

  beforeAll(async () => {
    // Login once for each version
    for (const v of versions) {
      tokens[v] = await loginUser(v);
    }
  });

  describe.each(versions)('API version %s', (version) => {
    let issueId;

    test('List issues with auth', async () => {
      const res = await global.testContext.request.get(`/api/${version}/issues`).set(getAuthHeader(tokens[version]));
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeArray();
    });

    test('Fail list issues without auth', async () => {
      const res = await global.testContext.request.get(`/api/${version}/issues`);
      expect(res.statusCode).toBe(401);
    });

    test('Create issue with valid data', async () => {
      const data = generateFakeIssueData();
      const res = await global.testContext.request.post(`/api/${version}/issues`).set(getAuthHeader(tokens[version])).send(data);
      expect(res.statusCode).toBe(201);
      expect(res.body).toContainKeys(['id', 'title', 'description']);
      issueId = res.body.id;
    });

    test('Create issue with missing required fields fails', async () => {
      const res = await global.testContext.request.post(`/api/${version}/issues`).set(getAuthHeader(tokens[version])).send({
        title: '',
        description: '',
      });
      expect(res.statusCode).toBe(400);
    });

    test('Get single issue', async () => {
      const res = await global.testContext.request.get(`/api/${version}/issues/${issueId}`).set(getAuthHeader(tokens[version]));
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(issueId);
    });

    test('Update issue title', async () => {
      const newTitle = 'Updated Issue Title';
      const res = await global.testContext.request.put(`/api/${version}/issues/${issueId}`).set(getAuthHeader(tokens[version])).send({
        title: newTitle,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe(newTitle);
    });

    test('Update issue without data fails', async () => {
      const res = await global.testContext.request.put(`/api/${version}/issues/${issueId}`).set(getAuthHeader(tokens[version])).send({});
      expect(res.statusCode).toBe(400);
    });

    test('Fetch issue revisions', async () => {
      const res = await global.testContext.request.get(`/api/${version}/issues/${issueId}/revisions`).set(getAuthHeader(tokens[version]));
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeArray();
      expect(res.body.length).toBeGreaterThan(0);
    });

    test('Compare revisions - valid range', async () => {
      const revisionsRes = await global.testContext.request.get(`/api/${version}/issues/${issueId}/revisions`).set(getAuthHeader(tokens[version]));
      const revisions = revisionsRes.body;
      if (revisions.length >= 2) {
        const from = revisions[0].revisionNumber;
        const to = revisions[revisions.length - 1].revisionNumber;
        const compRes = await request
          .get(`/api/${version}/issues/${issueId}/revisions/compare?from=${from}&to=${to}`)
          .set(getAuthHeader(tokens[version]));
        expect(compRes.statusCode).toBe(200);
        expect(compRes.body).toContainKeys(['before', 'after', 'changes', 'revisions']);
      } else {
        // Not enough revisions to test
        expect(true).toBe(true);
      }
    });

    test('Compare revisions - invalid range fails', async () => {
      const res = await global.testContext.request.get(`/api/${version}/issues/${issueId}/revisions/compare?from=9999&to=10000`).set(getAuthHeader(tokens[version]));
      expect([400, 404]).toContain(res.statusCode);
    });
  });
});