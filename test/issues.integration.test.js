const { loginUser, getAuthHeader, generateFakeIssueData } = require('./utils');

describe('Issues API Integration Tests', () => {
    let token;
    let issueId;

    beforeAll(async () => {
        token = await loginUser();
    });

    test('Create, fetch, update, list issue flow', async () => {
        const issueData = generateFakeIssueData();
        const createRes = await request
            .post('/api/v1/issues')
            .set(getAuthHeader(token))
            .send(issueData);
        expect(createRes.statusCode).toBe(201);
        issueId = createRes.body.id;

        const getRes = await request.get(`/api/v1/issues/${issueId}`).set(getAuthHeader(token));
        expect(getRes.statusCode).toBe(200);
        expect(getRes.body.title).toBe(issueData.title);

        const updateRes = await request
            .put(`/api/v1/issues/${issueId}`)
            .set(getAuthHeader(token))
            .send({ title: 'Updated Title' });
        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.title).toBe('Updated Title');

        const listRes = await request.get('/api/v1/issues').set(getAuthHeader(token));
        expect(listRes.statusCode).toBe(200);
        expect(Array.isArray(listRes.body)).toBe(true);
    });

    test('Fetch revisions and compare revisions', async () => {
        const revisionsRes = await request.get(`/api/v1/issues/${issueId}/revisions`).set(getAuthHeader(token));
        expect(revisionsRes.statusCode).toBe(200);
        expect(Array.isArray(revisionsRes.body)).toBe(true);

        if (revisionsRes.body.length >= 2) {
            const from = revisionsRes.body[0].revisionNumber;
            const to = revisionsRes.body[revisionsRes.body.length - 1].revisionNumber;

            const compareRes = await request
                .get(`/api/v1/issues/${issueId}/revisions/compare?from=${from}&to=${to}`)
                .set(getAuthHeader(token));
            expect(compareRes.statusCode).toBe(200);
            expect(compareRes.body).toContainKeys(['before', 'after', 'changes', 'revisions']);
        }
    });
});