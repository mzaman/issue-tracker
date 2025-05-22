'use strict';

const respond = require('./responses');
const Issue = require('../models/issue');

// const baseUrl = 'http://localhost:8080';

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

module.exports = Issues;