'use strict';

const _ = require('lodash');

const deepDiff = (obj1, obj2, prefix = '') => {
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
            changes[fullKey] = val2;
        }
    }

    return changes;
};

const descriptionFragments = {
    open: [
        'New issue reported.',
        'Needs triage and assignment.',
        'Waiting for more info from reporter.'
    ],
    in_progress: [
        'Currently investigating root cause.',
        'Attempting partial fixes.',
        'Logs collected for debugging.'
    ],
    resolved: [
        'Bug fixed and verified.',
        'Resolved after patch deployment.',
        'Issue marked resolved, pending close.'
    ],
    closed: [
        'Issue closed after QA confirmation.',
        'No further action required.',
        'Closed as duplicate or invalid.'
    ]
};

const priorityStatusRules = {
    critical: ['open', 'in_progress'],
    high: ['open', 'in_progress', 'resolved'],
    medium: ['open', 'in_progress', 'resolved', 'closed'],
    low: ['open', 'resolved', 'closed']
};

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const issues = await queryInterface.sequelize.query(
            'SELECT id, created_by, created_at, updated_by, updated_at, title, description, status, priority, assignee FROM issues ORDER BY id ASC',
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        const users = await queryInterface.sequelize.query(
            'SELECT id, email FROM users ORDER BY id ASC',
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        const revisions = [];

        for (const issue of issues) {
            let revisionNumber = 1;

            // Initial snapshot
            const initialSnapshot = {
                title: issue.title,
                description: issue.description,
                status: issue.status,
                priority: issue.priority,
                assignee: issue.assignee,
                createdBy: issue.created_by
            };

            revisions.push({
                issue_id: issue.id,
                revision_number: revisionNumber,
                issue: JSON.stringify(initialSnapshot),
                changes: JSON.stringify({}), // no changes for first revision
                updated_by: issue.updated_by || issue.created_by,
                updated_at: issue.updated_at ? new Date(issue.updated_at) : new Date(issue.created_at)
            });

            const totalRevisions = 5 + Math.floor(Math.random() * 5);

            for (let i = 1; i < totalRevisions; i++) {
                revisionNumber++;

                const lastSnapshot = JSON.parse(revisions[revisions.length - 1].issue);
                const changedFields = {};

                // Change status with probability and maintain priority compatibility
                if (Math.random() < 0.6) {
                    // Select a new status compatible with current priority (or fallback to all statuses)
                    const validStatuses = priorityStatusRules[lastSnapshot.priority] || ['open', 'in_progress', 'resolved', 'closed'];
                    // Randomly pick a different status than current
                    let newStatus;
                    do {
                        newStatus = validStatuses[Math.floor(Math.random() * validStatuses.length)];
                    } while (newStatus === lastSnapshot.status);
                    changedFields.status = newStatus;

                    // Update description accordingly
                    const descOptions = descriptionFragments[newStatus] || ['Status updated.'];
                    changedFields.description = lastSnapshot.description + ' ' + descOptions[Math.floor(Math.random() * descOptions.length)];
                } else if (Math.random() < 0.4) {
                    // Possibly update description with generic progress note
                    const progressNotes = [
                        'Work continues as planned.',
                        'Additional logs collected.',
                        'Awaiting user feedback.',
                        'Testing fixes in staging environment.'
                    ];
                    changedFields.description = lastSnapshot.description + ' ' + progressNotes[Math.floor(Math.random() * progressNotes.length)];
                }

                // Change priority respecting priority-status rules
                if (Math.random() < 0.5) {
                    // Select priority compatible with current or changed status
                    const currentStatus = changedFields.status || lastSnapshot.status;
                    const possiblePriorities = Object.entries(priorityStatusRules)
                        .filter(([, statuses]) => statuses.includes(currentStatus))
                        .map(([priority]) => priority);

                    let newPriority;
                    do {
                        newPriority = possiblePriorities[Math.floor(Math.random() * possiblePriorities.length)];
                    } while (newPriority === lastSnapshot.priority);

                    changedFields.priority = newPriority;
                }

                // Change title occasionally with suffixes
                if (Math.random() < 0.3) {
                    changedFields.title = lastSnapshot.title.replace(/ - (urgent|update)$/, '') +
                        (Math.random() < 0.5 ? ' - urgent' : ' - update');
                }

                // Change assignee following status logic
                if (Math.random() < 0.3) {
                    if (changedFields.status === 'closed' || changedFields.status === 'resolved') {
                        changedFields.assignee = null; // resolved/closed likely unassigned
                    } else {
                        changedFields.assignee = users[Math.floor(Math.random() * users.length)].id;
                    }
                }

                // Merge snapshots
                const newSnapshot = { ...lastSnapshot, ...changedFields };

                // Calculate deep changes object
                const changes = deepDiff(lastSnapshot, newSnapshot);

                const updatedBy = users[Math.floor(Math.random() * users.length)].id;

                const lastUpdatedAtRaw = revisions[revisions.length - 1].updated_at;
                const lastUpdatedAt = lastUpdatedAtRaw instanceof Date ? lastUpdatedAtRaw : new Date(lastUpdatedAtRaw);
                const updatedAt = new Date(lastUpdatedAt.getTime() + (24 * 60 * 60 * 1000) * (1 + Math.floor(Math.random() * 3)));

                revisions.push({
                    issue_id: issue.id,
                    revision_number: revisionNumber,
                    issue: JSON.stringify(newSnapshot),
                    changes: JSON.stringify(changes),
                    updated_by: updatedBy,
                    updated_at: updatedAt
                });

                // Update issue table with latest snapshot values
                await queryInterface.bulkUpdate(
                    'issues',
                    {
                        title: newSnapshot.title,
                        description: newSnapshot.description,
                        status: newSnapshot.status,
                        priority: newSnapshot.priority,
                        assignee: newSnapshot.assignee,
                        updated_by: updatedBy,
                        updated_at: updatedAt
                    },
                    { id: issue.id }
                );
            }
        }

        await queryInterface.bulkInsert('revisions', revisions, {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('revisions', null, {});
    }
};