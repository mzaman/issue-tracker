'use strict';

const { Op } = require('sequelize');
const respond = require('../../utils/responses');
const User = require('../../models/user');
const Issue = require('../../models/issue');
const Revision = require('../../models/revision');
const _ = require('lodash');
const Joi = require('joi');

// Allowed enums
const allowedStatuses = ['open', 'in_progress', 'resolved', 'closed'];
const allowedPriorities = ['low', 'medium', 'high', 'critical', 'urgent'];

// Validation schema for create validation
const issueSchema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().required(),
  status: Joi.string().valid(...allowedStatuses).default('open'),
  priority: Joi.string().valid(...allowedPriorities).default('medium'),
  assignee: Joi.number().integer().positive().allow(null)
});

// Joi schema for update validation
const updateSchema = Joi.object({
  title: Joi.string().max(255),
  description: Joi.string().allow(''),
  status: Joi.string().valid(...allowedStatuses),
  priority: Joi.string().valid(...allowedPriorities),
  assignee: Joi.alternatives().try(Joi.number().integer(), Joi.string().pattern(/^\d+$/), Joi.allow(null), Joi.allow(''))
}).or('title', 'description', 'status', 'priority', 'assignee'); // At least one field required

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

const filterKeys = (obj) => {
  const { id, created_at, updated_at, ...rest } = obj;
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

/**
 * Recursively compute the deep difference between two objects.
 * Returns an object containing keys with changed values from obj1 to obj2.
 * Supports nested objects.
 *
 * @param {object} obj1 - Original object (before)
 * @param {object} obj2 - Modified object (after)
 * @param {string} prefix - Used internally for nested keys (dot notation)
 * @returns {object} - Key-value pairs of changed properties and their new values
 */
const deepDiff = (obj1, obj2, prefix = '') => {
  const changes = {};
  const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

  for (const key of keys) {
    const val1 = obj1 ? obj1[key] : undefined;
    const val2 = obj2 ? obj2[key] : undefined;
    const fullKey = prefix ? `${prefix}.${key}` : key;

    // Skip if values are deeply equal
    if (_.isEqual(val1, val2)) continue;

    // If both values are objects, recurse
    if (_.isObject(val1) && _.isObject(val2)) {
      Object.assign(changes, deepDiff(val1, val2, fullKey));
    } else {
      changes[fullKey] = val2;
      // To include old values, use:
      // changes[fullKey] = { from: val1, to: val2 };
    }
  }

  return changes;
};

/**
 * Parse revision identifier from query param.
 * Accepts either an integer revision number or an ISO timestamp string.
 *
 * @param {string} val - Input string (e.g., '5' or '2025-05-24T10:00:00Z')
 * @returns {object|null} - { type: 'revisionNumber'|'updatedAt', value: number|Date } or null if invalid
 */
const parseRevisionIdentifier = (val) => {
  if (!val) return null;

  // Try integer revision number
  const intVal = parseInt(val, 10);
  if (!isNaN(intVal) && intVal > 0) return { type: 'revisionNumber', value: intVal };

  // Try ISO date
  const dateVal = new Date(val);
  if (!isNaN(dateVal.getTime())) return { type: 'updatedAt', value: dateVal };

  return null;
};


// GET /issues/:id
Issues.get = async (context) => {
  try {
    const issue = await Issue.findByPk(context.params.id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['email', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['email', 'name']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['email', 'name']
        }
      ]
    });

    if (!issue) {
      return respond.notFound(context);
    }

    const formattedIssue = {
      // id: issue.id,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      assignee: issue.assignedUser ?? null,
      createdBy: issue.creator ?? null,
      updatedBy: issue.updater ?? null,
      // createdAt: issue.created_at,
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
  const userId = ctx.state.user?.id;

  if (!userId) {
    return respond.unauthorized(ctx, 'Authentication required');
  }

  // Validate input
  const { error, value } = issueSchema.validate(ctx.request.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map((d) => d.message);
    return respond.badRequest(ctx, messages);
  }

  const { title, description, status, priority, assignee } = value;

  try {
    // Check for duplicate issue
    const existingIssue = await Issue.findOne({
      where: {
        title,
        description
      }
    });

    if (existingIssue) {
      return respond.conflict(ctx, 'Issue already exists');
    }

    // Treat empty string as null
    if (assignee === '') {
      assignee = null;
    }

    // Validate assignee (if provided and not null)
    if (assignee !== null) {
      const userExists = await User.findByPk(assignee);
      if (!userExists) {
        return respond.badRequest(ctx, [`Assignee with ID ${assignee} does not exist`]);
      }
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

    await issue.reload(); // Ensure timestamps are updated

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
      changes: JSON.stringify({}), // No changes for the initial revision
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

// Partially updating an issue
// PATCH /issues/:id
Issues.patch = async (ctx) => {
  const id = ctx.params.id;
  const userId = ctx.state.user?.id;

  if (!userId) {
    return respond.unauthorized(ctx, 'Authentication required');
  }

  // Validate input
  const { error, value } = updateSchema.validate(ctx.request.body, { abortEarly: false });
  if (error) {
    return respond.badRequest(ctx, error.details.map(e => e.message));
  }

  const { title, description, status, priority, assignee } = value;

  try {
    const issue = await Issue.findByPk(id);
    if (!issue) {
      return respond.notFound(ctx);
    }

    // Capture old state BEFORE updates
    const oldIssue = filterKeys(issue.toJSON());

    // Prevent duplicate issues with same title and description
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

    // Handle assignee logic
    if (typeof assignee !== 'undefined') {
      if (assignee === null || assignee === '') {
        issue.assignee = null;
      } else {
        const assigneeId = parseInt(assignee, 10);
        const assigneeExists = await User.findByPk(assigneeId);
        if (!assigneeExists) {
          return respond.badRequest(ctx, [`Assignee with ID ${assigneeId} does not exist`]);
        }
        issue.assignee = assigneeId;
      }
    }

    // Update fields
    if (title) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (status) issue.status = status;
    if (priority) issue.priority = priority;

    issue.updatedBy = userId;

    await issue.save();

    // Get updated state AFTER save
    const updatedIssueRaw = issue.toJSON();
    const newIssue = filterKeys(updatedIssueRaw);

    // Compute changes (you can also use deepDiff if needed)
    const changes = deepDiff(oldIssue, newIssue);

    const revisionCount = await Revision.count({ where: { issueId: issue.id } });

    await Revision.create({
      issueId: issue.id,
      revisionNumber: revisionCount + 1,
      issue: newIssue,
      changes,
      updatedBy: userId,
      updatedAt: issue.updatedAt || new Date()
    });

    respond.success(ctx, updatedIssueRaw);
  } catch (err) {
    console.error('Error updating issue:', err);
    respond.internalError(ctx);
  }
};

/**
 * Controller method to list issues with pagination, filtering, searching, and sorting.
 *
 * Endpoint example:
 *   GET /issues?page=2&pageSize=20&status=open&priority=high&search=login&sortBy=updated_at&sortOrder=desc
 *
 * Query Parameters:
 * - page (optional): integer, defaults to 1, the current page number (1-based).
 * - pageSize (optional): integer, defaults to 10, number of records per page (max 100).
 * - status (optional): string or comma-separated strings, filter by issue status.
 * - priority (optional): string or comma-separated strings, filter by priority.
 * - assignee (optional): integer, filter by assignee user ID.
 * - search (optional): string, case-insensitive substring search on title and description.
 * - sortBy (optional): string, column name to sort by; allowed: 'created_at', 'updated_at', 'priority', 'status'.
 * - sortOrder (optional): string, 'asc' or 'desc', defaults to 'desc'.
 *
 * Response format:
 * {
 *   success: true,
 *   data: {
 *     issues: [ /* array of issue objects *\/ ],
 *     pagination: {
 *       totalItems: <total matching records>,
 *       totalPages: <number of pages>,
 *       currentPage: <page number>,
 *       pageSize: <page size>
 *     }
 *   },
 *   message: "Success",
 *   errors: null
 * }
 *
 * Error handling:
 * - Returns 500 internal error on DB failure.
 */
Issues.list = async (ctx) => {
  try {
    // --- Parse and sanitize pagination parameters ---
    const page = Math.max(parseInt(ctx.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(ctx.query.pageSize, 10) || 10, 1), 100);
    const offset = (page - 1) * pageSize;

    // --- Filtering ---
    const filters = {};

    // Status filter supports single or comma-separated multiple statuses
    if (ctx.query.status) {
      const statuses = ctx.query.status.split(',').map(s => s.trim().toLowerCase());
      filters.status = { [Op.in]: statuses };
    }

    // Priority filter supports single or comma-separated multiple priorities
    if (ctx.query.priority) {
      const priorities = ctx.query.priority.split(',').map(p => p.trim().toLowerCase());
      filters.priority = { [Op.in]: priorities };
    }

    // Assignee filter expects a single user ID integer
    if (ctx.query.assignee) {
      const assigneeId = parseInt(ctx.query.assignee, 10);
      if (!isNaN(assigneeId)) {
        filters.assignee = assigneeId;
      }
    }

    // --- Searching ---
    // Search in title and description using case-insensitive LIKE %search%
    const search = ctx.query.search?.trim();
    const searchCondition = search
      ? {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ]
      }
      : null;

    // --- Sorting ---
    const allowedSortFields = ['created_at', 'updated_at', 'priority', 'status'];
    let sortBy = ctx.query.sortBy && allowedSortFields.includes(ctx.query.sortBy) ? ctx.query.sortBy : 'created_at';
    let sortOrder = ctx.query.sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // --- Compose final WHERE clause ---
    const where = searchCondition ? { ...filters, ...searchCondition } : filters;

    // --- Query with pagination, filtering, searching, sorting ---
    const { count, rows: issues } = await Issue.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit: pageSize,
      offset
    });

    const totalPages = Math.ceil(count / pageSize);

    // --- Construct response ---
    const responseData = {
      issues,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        pageSize
      }
    };

    respond.success(ctx, responseData);
  } catch (error) {
    console.error('Error fetching issues:', error);
    respond.internalError(ctx);
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
 * Compare two revisions of a particular issue.
 * Supports revision numbers or ISO timestamps as input.
 * Returns snapshots before and after, computed changes, and full revision trail.
 *
 * Endpoint: GET /issues/:id/revisions/compare?from=...&to=...&order=asc|desc
 *
 * Query params:
 *  - from: revision ID (int) or ISO timestamp (string), optional, defaults to 1
 *  - to: revision ID (int) or ISO timestamp (string), optional, defaults to latest revision
 *  - order: 'asc' or 'desc' (default 'asc')
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     before: { /* issue snapshot at 'from' revision *\/ },
 *     after: { /* issue snapshot at 'to' revision *\/ },
 *     changes: { /* deep diff from before to after *\/ },
 *     revisions: [ /* full list of revisions between from and to *\/ ]
 *   },
 *   message: "Success",
 *   errors: null
 * }
 *
 * @param {object} ctx - Koa context
 */
Issues.compareRevisions = async (ctx) => {
  const issueId = ctx.params.id;
  const fromParam = ctx.query.from;
  const toParam = ctx.query.to;
  const orderParam = (ctx.query.order || 'asc').toLowerCase();

  if (!issueId) {
    return respond.badRequest(ctx, ['Issue ID is required']);
  }

  // Parse revision identifiers (helper function not shown here)
  const fromParsed = parseRevisionIdentifier(fromParam) || { type: 'revisionNumber', value: 1 };
  let toParsed = parseRevisionIdentifier(toParam);

  try {
    // Get max revisionNumber or latest updatedAt
    if (!toParsed) {
      if (fromParsed.type === 'revisionNumber') {
        const maxRev = await Revision.max('revisionNumber', { where: { issueId } });
        if (!maxRev) return respond.notFound(ctx);
        toParsed = { type: 'revisionNumber', value: maxRev };
      } else if (fromParsed.type === 'updatedAt') {
        const latestRev = await Revision.findOne({
          where: { issueId },
          order: [['updatedAt', 'DESC']]
        });
        if (!latestRev) return respond.notFound(ctx);
        toParsed = { type: 'updatedAt', value: latestRev.updatedAt };
      }
    }

    // Ensure both are of the same type
    if (fromParsed.type !== toParsed.type) {
      return respond.badRequest(ctx, ['`from` and `to` must both be revision IDs or both timestamps']);
    }

    // Fix: If toRevision exceeds max revision number, clamp it to max revision
    if (fromParsed.type === 'revisionNumber') {
      const maxRev = await Revision.max('revisionNumber', { where: { issueId } });
      if (!maxRev) return respond.notFound(ctx);

      if (toParsed.value > maxRev) {
        toParsed.value = maxRev;
      }
      if (fromParsed.value > maxRev) {
        fromParsed.value = maxRev; // optional: clamp from as well
      }
    }

    // If from and to are equal, return the single revision as before = after, no changes
    if (fromParsed.value === toParsed.value) {
      // Fetch that revision
      const singleRevWhere = { issueId };
      if (fromParsed.type === 'revisionNumber') {
        singleRevWhere.revisionNumber = fromParsed.value;
      } else {
        singleRevWhere.updatedAt = fromParsed.value;
      }
      const singleRevision = await Revision.findOne({ where: singleRevWhere });
      if (!singleRevision) {
        return respond.notFound(ctx);
      }

      const snapshot = singleRevision.issue;
      respond.success(ctx, {
        before: snapshot,
        after: snapshot,
        changes: {}, // no changes between same revision
        revisions: [singleRevision.toJSON()]
      });
      return;
    }

    // Determine edge revisions for diff
    const edgeWhere = { issueId };
    if (fromParsed.type === 'revisionNumber') {
      edgeWhere.revisionNumber = { [Op.in]: [fromParsed.value, toParsed.value] };
    } else {
      edgeWhere.updatedAt = { [Op.in]: [fromParsed.value, toParsed.value] };
    }

    // Fetch start and end revisions
    const edgeRevisions = await Revision.findAll({
      where: edgeWhere,
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

    // Compute deep diff
    const changes = deepDiff(before, after);

    // Fetch full revision trail between from and to (inclusive)
    const trailWhere = { issueId };
    if (fromParsed.type === 'revisionNumber') {
      const [start, end] = fromParsed.value < toParsed.value
        ? [fromParsed.value, toParsed.value]
        : [toParsed.value, fromParsed.value];
      trailWhere.revisionNumber = { [Op.between]: [start, end] };
    } else {
      const [start, end] = fromParsed.value < toParsed.value
        ? [fromParsed.value, toParsed.value]
        : [toParsed.value, fromParsed.value];
      trailWhere.updatedAt = { [Op.between]: [start, end] };
    }

    // Fetch full revision trail with requested order
    const trail = await Revision.findAll({
      where: trailWhere,
      order: [['revisionNumber', orderParam === 'desc' ? 'DESC' : 'ASC']]
    });

    // Remove id and issueId from revisions in response
    const cleanTrail = trail.map(r => {
      const obj = r.toJSON();
      delete obj.id;
      delete obj.issueId;
      return obj;
    });

    respond.success(ctx, {
      before,
      after,
      changes,
      revisions: cleanTrail
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


module.exports = Issues;