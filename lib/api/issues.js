'use strict';

const { Op } = require('sequelize');
const respond = require('./responses');
const User = require('../models/user');
const Issue = require('../models/issue');
const Revision = require('../models/revision');
const _ = require('lodash');

// const baseUrl = 'http://localhost:8080'; // Commented as unused variable, good to avoid hard coded values

const Issues = {};

const getChanges = (oldObj, newObj) => {
  const changes = {};
  for (const key in newObj) {
    if (oldObj[key] !== newObj[key]) {
      changes[key] = newObj[key];
    }
  }
  return changes;
}

// Helper to map user DB fields to camelCase API response
const toCamelCaseUser = (user) => user ? {
  id: user.id,
  email: user.email,
  name: user.name,
  createdAt: user.created_at,
  updatedAt: user.updated_at
} : null;

const omitTimestamps = (obj) => {
  const { created_at, updated_at, ...rest } = obj;
  return rest;
};

/**
 * Helper to compute simple differences between two objects:
 * returns an object with keys that changed and their new values (from after).
 */
const diffObjects = (before, after) => {
  const changes = {};
  for (const key of Object.keys(after)) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changes[key] = after[key];
    }
  }
  return changes;
}

// GET /issues/:id
Issues.get = async (context) => {
  try {
    const issue = await Issue.findByPk(context.params.id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'email', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'name']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'email', 'name']
        }
      ]
    });

    if (!issue) {
      return respond.notFound(context);
    }

    const formattedIssue = {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      assignee: issue.assignedUser ?? null,
      createdBy: issue.creator ?? null,
      updatedBy: issue.updater ?? null,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at
    };

    respond.success(context, formattedIssue);
  } catch (err) {
    console.error('Error fetching issue:', err);
    respond.internalError(context);
  }
};

// Create an issue
// POST /issues
Issues.create = async (ctx) => {
  const { title, description, status = 'open', priority = 'medium', assignee = null } = ctx.request.body;

  if (!title || !description) {
    return respond.badRequest(ctx, ['Title and description are required']);
  }

  const userId = ctx.state.user?.id;

  if (!userId) {
    return respond.unauthorized(ctx, 'Authentication required');
  }

  try {
    // Check if an issue with the same title and description exists
    const existingIssue = await Issue.findOne({
      where: {
        title,
        description
      }
    });

    if (existingIssue) {
      return respond.conflict(ctx, 'Issue already exists');
    }

    const issue = await Issue.create({
      title,
      description,
      status,
      priority,
      assignee,
      createdBy: userId,
      updatedBy: userId
    });

    // Reload to ensure timestamps are populated
    await issue.reload();

    const revisionData = {
      // id: issue.id,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      assignee: issue.assignee,
      createdBy: issue.createdBy,
      updatedBy: userId,
      // createdAt: issue.createdAt,
      // updatedAt: issue.updatedAt
    };

    await Revision.create({
      issueId: issue.id,
      revisionNumber: 1,
      issue: revisionData,
      // changes: revisionData,
      updatedBy: userId,
      updatedAt: issue.updatedAt || new Date()
    });

    respond.created(ctx, issue.toJSON());
  } catch (err) {
    console.error('Error creating issue:', err);

    if (err.name === 'SequelizeUniqueConstraintError') {
      return respond.conflict(ctx, 'Issue already exists');
    }

    respond.internalError(ctx);
  }
};

// Update an issue
// PUT /issues/:id
Issues.update = async (ctx) => {
  const id = ctx.params.id;
  const { title, description, status, priority, assignee } = ctx.request.body;

  if (!title && !description && !status && !priority && typeof assignee === 'undefined') {
    return respond.badRequest(ctx, ['At least one field must be provided to update']);
  }

  const userId = ctx.state.user?.id;
  if (!userId) {
    return respond.unauthorized(ctx, 'Authentication required');
  }

  try {
    const issue = await Issue.findByPk(id);
    if (!issue) {
      return respond.notFound(ctx);
    }

    // Check duplicate issue if title or description changed
    if ((title && title !== issue.title) || (description && description !== issue.description)) {
      const existingIssue = await Issue.findOne({
        where: {
          title: title || issue.title,
          description: description || issue.description,
          id: { [Op.ne]: id }
        }
      });
      if (existingIssue) {
        return respond.conflict(ctx, 'Another issue with the same title and description exists');
      }
    }

    const oldIssueRaw = issue.toJSON();

    if (title) issue.title = title;
    if (description) issue.description = description;
    if (status) issue.status = status;
    if (priority) issue.priority = priority;
    if (typeof assignee !== 'undefined') issue.assignee = assignee;

    issue.updatedBy = userId;

    await issue.save();

    const newIssueRaw = issue.toJSON();

    // Prepare objects for revision, excluding timestamps
    const oldIssue = omitTimestamps(oldIssueRaw);
    const newIssue = omitTimestamps(newIssueRaw);

    const changes = getChanges(oldIssue, newIssue);

    const revisionCount = await Revision.count({ where: { issueId: issue.id } });

    await Revision.create({
      issueId: issue.id,
      revisionNumber: revisionCount + 1,
      issue: newIssue,
      changes,
      updatedBy: userId,
      updatedAt: issue.updatedAt || new Date()
    });

    respond.success(ctx, newIssueRaw);
  } catch (err) {
    console.error('Error updating issue:', err);
    respond.internalError(ctx);
  }
};

// GET /issues (all issues)
Issues.list = async (context) => {
  try {
    const issues = await Issue.findAll({ order: [['created_at', 'DESC']] });
    respond.success(context, issues);
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
      order: [['updatedAt', 'ASC']],
      attributes: { exclude: ['id', 'issueId'] }
    });

    if (!revisions || revisions.length === 0) {
      return respond.notFound(context);
    }

    respond.success(context, revisions);
  } catch (err) {
    console.error('Error fetching revisions:', err);
    respond.internalError(context);
  }
};

/**
 * GET /issues/:issueId/revisions/compare?from=1&to=5
 * Compare two revisions of an issue and return before, after, changes, and full trail.
 * Defaults:
 *   from = 1 if missing/invalid
 *   to = last revision number if missing/invalid
 */

Issues.compareRevisions = async (ctx) => {
  const issueId = ctx.params.id;
  let fromRev = parseInt(ctx.query.from, 10);
  let toRev = parseInt(ctx.query.to, 10);

  if (!issueId) {
    return respond.badRequest(ctx, ['Issue ID is required']);
  }

  const isValidRevisionNumber = (num) => Number.isInteger(num) && num > 0;

  if (!isValidRevisionNumber(fromRev)) {
    fromRev = 1;
  }

  try {
    const maxRevision = await Revision.max('revisionNumber', { where: { issueId } });
    if (!maxRevision) {
      return respond.notFound(ctx);
    }

    if (!isValidRevisionNumber(toRev) || toRev > maxRevision) {
      toRev = maxRevision;
    }

    if (fromRev === toRev) {
      return respond.badRequest(ctx, ['`from` and `to` revision numbers must be different']);
    }

    const [startRev, endRev] = fromRev < toRev ? [fromRev, toRev] : [toRev, fromRev];

    // Fetch revisions for the two revision numbers
    const edgeRevisions = await Revision.findAll({
      where: {
        issueId,
        revisionNumber: { [Op.in]: [startRev, endRev] }
      },
      order: [['revisionNumber', 'ASC']]
    });

    if (edgeRevisions.length < 2) {
      return respond.notFound(ctx);
    }

    const before = edgeRevisions[0].issue;
    const after = edgeRevisions[1].issue;

    if (!before || !after) {
      return respond.internalError(ctx, 'Revision snapshots are missing');
    }

    const changes = diffObjects(before, after);

    // Fetch full revision trail between startRev and endRev (inclusive)
    const trail = await Revision.findAll({
      where: {
        issueId,
        revisionNumber: {
          [Op.gte]: startRev,
          [Op.lte]: endRev
        }
      },
      order: [['revisionNumber', 'ASC']]
    });

    respond.success(ctx, {
      before,
      after,
      changes,
      revisions: trail.map(r => r.toJSON())
    });
  } catch (err) {
    console.error('Error comparing revisions:', err);
    respond.internalError(ctx);
  }
};

// Issue comparison trails
// GET /issues/:id/compare?from=revisionId&to=revisionId

/**
 * Compare two revisions of an issue, supporting ID or ISO timestamp,
 * shallow or deep diff, and ascending/descending order of revisions.
 *
 * Query params:
 *  - from: revision ID (int) or ISO timestamp (string)
 *  - to: revision ID (int) or ISO timestamp (string)
 *  - direction: 'asc' (default) or 'desc'
 *  - type: 'shallow' (default) or 'deep'
 */
Issues.compare = async (ctx) => {
  const issueId = ctx.params.id;
  let { from, to, direction = 'asc', type = 'shallow' } = ctx.query;

  // Set defaults if from/to missing:
  if (!from || !to) {
    // Get oldest and newest revision for issue
    const oldest = await Revision.findOne({
      where: { issue_id: issueId },
      order: [['updated_at', 'ASC']],
    });
    const newest = await Revision.findOne({
      where: { issue_id: issueId },
      order: [['updated_at', 'DESC']],
    });
    if (!oldest || !newest) {
      ctx.status = 404;
      ctx.body = { message: 'No revisions found for this issue' };
      return;
    }
    from = from || oldest.updated_at.toISOString();
    to = to || newest.updated_at.toISOString();
  }

  // Validate direction param:
  direction = ['asc', 'desc'].includes(direction.toLowerCase()) ? direction.toLowerCase() : 'asc';

  // Validate type param:
  type = ['shallow', 'deep'].includes(type.toLowerCase()) ? type.toLowerCase() : 'shallow';

  // Utility to detect date string or ID number:
  const isDateString = (val) => {
    return !isNaN(Date.parse(val));
  };

  const fromIsDate = isDateString(from);
  const toIsDate = isDateString(to);

  try {
    let revA, revB, revisions;

    if (fromIsDate && toIsDate) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const [start, end] = fromDate <= toDate ? [fromDate, toDate] : [toDate, fromDate];

      revA = await Revision.findOne({
        where: { issue_id: issueId, updated_at: { [Op.gte]: start } },
        order: [['updated_at', 'ASC']],
      });
      revB = await Revision.findOne({
        where: { issue_id: issueId, updated_at: { [Op.lte]: end } },
        order: [['updated_at', 'DESC']],
      });

      if (!revA || !revB) {
        ctx.status = 404;
        ctx.body = { message: 'Revisions not found for given timestamps' };
        return;
      }

      revisions = await Revision.findAll({
        where: {
          issue_id: issueId,
          updated_at: { [Op.between]: [start, end] },
        },
        order: [['updated_at', direction.toUpperCase()]],
      });

    } else if (!fromIsDate && !toIsDate) {
      const fromId = parseInt(from, 10);
      const toId = parseInt(to, 10);
      const [startId, endId] = fromId <= toId ? [fromId, toId] : [toId, fromId];

      revA = await Revision.findOne({ where: { id: startId, issue_id: issueId } });
      revB = await Revision.findOne({ where: { id: endId, issue_id: issueId } });

      if (!revA || !revB) {
        ctx.status = 404;
        ctx.body = { message: 'Revisions not found for given IDs' };
        return;
      }

      revisions = await Revision.findAll({
        where: {
          issue_id: issueId,
          id: { [Op.between]: [startId, endId] },
        },
        order: [['id', direction.toUpperCase()]],
      });

    } else {
      ctx.status = 400;
      ctx.body = { message: 'from and to parameters must both be IDs or both be timestamps' };
      return;
    }

    const before = JSON.parse(revA.revision_data);
    const after = JSON.parse(revB.revision_data);

    let changes;
    if (type === 'deep') {
      changes = deepDiff(before, after);
    } else {
      changes = {};
      for (const key of Object.keys(after)) {
        if (!_.isEqual(before[key], after[key])) {
          changes[key] = { from: before[key], to: after[key] };
        }
      }
    }

    ctx.body = {
      before,
      after,
      changes,
      revisions: revisions.map(r => ({
        id: r.id,
        revision_data: JSON.parse(r.revision_data),
        updated_at: r.updated_at,
      })),
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: 'Internal Server Error', error: error.message };
  }
};

function deepDiff(obj1, obj2, prefix = '') {
  const changes = {};
  const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

  for (const key of keys) {
    const val1 = obj1 ? obj1[key] : undefined;
    const val2 = obj2 ? obj2[key] : undefined;
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (_.isEqual(val1, val2)) continue;

    if (_.isObject(val1) && _.isObject(val2)) {
      Object.assign(changes, deepDiff(val1, val2, fullKey));
    } else {
      changes[fullKey] = { from: val1, to: val2 };
    }
  }

  return changes;
}

// Issues.compare_revisions = async (ctx) => {
//   const issueId = ctx.params.id;
//   const { from, to } = ctx.query;

//   if (!from || !to) {
//     ctx.status = 400;
//     ctx.body = { message: 'Both from and to revision IDs must be provided.' };
//     return;
//   }

//   try {
//     const Revision = require('../models/revision');

//     const revA = await Revision.findOne({ where: { id: from, issue_id: issueId } });
//     const revB = await Revision.findOne({ where: { id: to, issue_id: issueId } });

//     if (!revA || !revB) {
//       ctx.status = 404;
//       ctx.body = { message: 'One or both revisions not found for this issue.' };
//       return;
//     }

//     const before = JSON.parse(revA.revision_data);
//     const after = JSON.parse(revB.revision_data);

//     const changes = {};
//     for (const key of Object.keys(after)) {
//       if (before[key] !== after[key]) {
//         changes[key] = { from: before[key], to: after[key] };
//       }
//     }

//     // Determine range (inclusive)
//     const minId = Math.min(Number(from), Number(to));
//     const maxId = Math.max(Number(from), Number(to));

//     const revisions = await Revision.findAll({
//       where: {
//         issue_id: issueId,
//         id: {
//           [require('sequelize').Op.between]: [minId, maxId]
//         }
//       },
//       order: [['id', 'ASC']]
//     });

//     ctx.body = {
//       before,
//       after,
//       changes,
//       revisions: revisions.map(r => ({
//         id: r.id,
//         revision_data: JSON.parse(r.revision_data),
//         updated_at: r.updated_at
//       }))
//     };

//   } catch (error) {
//     ctx.status = 500;
//     ctx.body = { message: 'Internal Server Error', error: error.message };
//   }
// };

module.exports = Issues;