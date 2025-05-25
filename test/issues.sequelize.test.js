const sinon = require('sinon');
const { sequelize, dataTypes, checkModelName, checkPropertyExists } = require('sequelize-test-helpers');
const { expect } = require('expect');

const IssueModel = require('../src/models/issue');
const RevisionModel = require('../src/models/revision');
const UserModel = require('../src/models/user');

describe('Issue Model', () => {
    const Issue = IssueModel(sequelize, dataTypes);
    const issue = new Issue();

    checkModelName(Issue)('Issue');
    ['title', 'description', 'status', 'priority', 'assignee', 'createdBy', 'updatedBy'].forEach(checkPropertyExists(issue));
});

describe('Revision Model', () => {
    const Revision = RevisionModel(sequelize, dataTypes);
    const revision = new Revision();

    checkModelName(Revision)('Revision');
    ['revisionNumber', 'issueSnapshot', 'changes', 'updatedBy', 'updatedAt'].forEach(checkPropertyExists(revision));
});

describe('Issue Controller', () => {
    let sandbox, IssueStub, RevisionStub, ctx, Issues;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        IssueStub = {
            findAll: sandbox.stub(),
            findByPk: sandbox.stub(),
            create: sandbox.stub(),
            update: sandbox.stub(),
        };
        RevisionStub = {
            findAll: sandbox.stub(),
            count: sandbox.stub(),
            create: sandbox.stub(),
            max: sandbox.stub(),
        };

        // Proxyquire or direct import with injected mocks (if you refactor code to accept models)
        Issues = require('../src/controllers/v1/issues');
        ctx = {
            request: { body: {}, query: {}, params: {} },
            status: 0,
            body: null,
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    test('list issues returns data', async () => {
        IssueStub.findAll.resolves([{ id: 1 }, { id: 2 }]);
        await Issues.list(ctx);
        expect(ctx.status).toBe(200);
        expect(ctx.body).toEqual(expect.arrayContaining([{ id: 1 }, { id: 2 }]));
    });

    test('get issue by id returns 404 if not found', async () => {
        IssueStub.findByPk.resolves(null);
        ctx.params.id = 999;
        await Issues.get(ctx);
        expect(ctx.status).toBe(404);
    });
});