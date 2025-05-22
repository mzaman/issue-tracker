'use strict';

const respond = require('./responses');
const Issue = require('../models/issue');
const Revision = require('../models/revision');

// const baseUrl = 'http://localhost:8080'; // Commented as unused variable, good to avoid hard coded values

function getChanges(oldObj, newObj) {
  const changes = {};
  for (const key in newObj) {
    if (oldObj[key] !== newObj[key]) {
      changes[key] = newObj[key];
    }
  }
  return changes;
}

const Issues = {};

// GET /issues/:id
Issues.get = async (context) => {
  try {
    const issue = await Issue.findByPk(context.params.id);
    if (!issue) {
      return respond.notFound(context);
    }
    respond.success(context, { issue });
  } catch (err) {
    console.error('Error fetching issue:', err);
    respond.internalError(context);
  }
};

// POST /issues
Issues.create = async (context) => {
  const { title, description, created_by = 'unknown', updated_by = 'unknown' } = context.request.body;

  if (!title || !description) {
    return respond.badRequest(context, ['Title and description are required']);
  }

  try {
    const issue = await Issue.create({ title, description, created_by, updated_by });

    // Create initial revision (full state, all fields are changes)
    await Revision.create({
      issueId: issue.id,
      revisionData: issue.toJSON(),
      changes: { title, description, created_by, updated_by },
      updatedAt: new Date()
    });

    respond.created(context, { issue });
  } catch (err) {
    console.error('Error creating issue:', err);

    if (err.name === 'SequelizeUniqueConstraintError') {
      return respond.conflict(context, 'Issue already exists');
    }

    respond.internalError(context);
  }
};

// PUT /issues/:id
// Update an issue
Issues.update = async (context) => {
  const id = context.params.id;
  const { title, description, updated_by = 'unknown' } = context.request.body;

  if (!title && !description) {
    return respond.badRequest(context, ['At least one of title or description must be provided']);
  }

  try {
    const issue = await Issue.findByPk(id);
    if (!issue) {
      return respond.notFound(context);
    }

    const oldIssue = issue.toJSON();

    if (title) issue.title = title;
    if (description) issue.description = description;
    issue.updated_by = updated_by;

    await issue.save();

    const changes = getChanges(oldIssue, issue.toJSON());

    await Revision.create({
      issueId: issue.id,
      revisionData: issue.toJSON(),
      changes,
      updatedAt: new Date()
    });

    respond.success(context, { issue });
  } catch (err) {
    console.error('Error updating issue:', err);
    respond.internalError(context);
  }
};


// GET /issues (all issues)
Issues.list = async (context) => {
  try {
    const issues = await Issue.findAll({ order: [['created_at', 'DESC']] });
    respond.success(context, { issues });
  } catch (err) {
    console.error('Error fetching issues:', err);
    respond.internalError(context);
  }
};

// GET /issues/:id/revisions
Issues.revisions = async (context) => {
  const issueId = context.params.id;

  try {
    const revisions = await Revision.findAll({
      where: { issueId },
      order: [['updatedAt', 'DESC']]
    });

    if (!revisions || revisions.length === 0) {
      return respond.notFound(context);
    }

    respond.success(context, { revisions });
  } catch (err) {
    console.error('Error fetching revisions:', err);
    respond.internalError(context);
  }
};

// Issue comparison trails
// GET /issues/:id/compare?from=revisionId&to=revisionId
Issues.compare = async (ctx) => {
  const issueId = ctx.params.id;
  const { from, to } = ctx.query;

  if (!from || !to) {
    ctx.status = 400;
    ctx.body = { message: 'Both from and to revision IDs must be provided.' };
    return;
  }

  try {
    const Revision = require('../models/revision');

    const revA = await Revision.findOne({ where: { id: from, issue_id: issueId } });
    const revB = await Revision.findOne({ where: { id: to, issue_id: issueId } });

    if (!revA || !revB) {
      ctx.status = 404;
      ctx.body = { message: 'One or both revisions not found for this issue.' };
      return;
    }

    const before = JSON.parse(revA.revision_data);
    const after = JSON.parse(revB.revision_data);

    const changes = {};
    for (const key of Object.keys(after)) {
      if (before[key] !== after[key]) {
        changes[key] = { from: before[key], to: after[key] };
      }
    }

    // Determine range (inclusive)
    const minId = Math.min(Number(from), Number(to));
    const maxId = Math.max(Number(from), Number(to));

    const revisions = await Revision.findAll({
      where: {
        issue_id: issueId,
        id: {
          [require('sequelize').Op.between]: [minId, maxId]
        }
      },
      order: [['id', 'ASC']]
    });

    ctx.body = {
      before,
      after,
      changes,
      revisions: revisions.map(r => ({
        id: r.id,
        revision_data: JSON.parse(r.revision_data),
        updated_at: r.updated_at
      }))
    };

  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: 'Internal Server Error', error: error.message };
  }
};

module.exports = Issues;