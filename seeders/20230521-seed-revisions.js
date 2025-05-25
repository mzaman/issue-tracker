'use strict';

const _ = require('lodash');
const { faker } = require('@faker-js/faker');

// Deep diff function to find changed fields between two snapshots
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

// Description fragments grouped by status
const descriptionFragments = {
    open: [
        'New issue reported.',
        'Needs triage and assignment.',
        'Waiting for more info from reporter.',
        'Initial investigation pending.',
        'Reported by user, unverified.',
        'Reproducing the issue on staging.',
        'Under review by support team.',
        'Reported by QA.',
        'Issue logged into tracker.',
        'Pending prioritization.',
        'User feedback requested.',
        'Waiting on environment setup.',
        'Blocked by dependency update.'
    ],
    in_progress: [
        'Currently investigating root cause.',
        'Attempting partial fixes.',
        'Logs collected for debugging.',
        'Patch development underway.',
        'Working on a hotfix.',
        'Collaboration with QA initiated.',
        'Testing in local environment.',
        'Root cause analysis in progress.',
        'Code review ongoing.',
        'Applying workaround.',
        'Debugging intermittent failure.',
        'Preparing fix for review.'
    ],
    resolved: [
        'Bug fixed and verified.',
        'Resolved after patch deployment.',
        'Issue marked resolved, pending close.',
        'Fix merged into main branch.',
        'QA verified fix successfully.',
        'Patch scheduled for production.',
        'Root cause identified and addressed.',
        'Code pushed to master branch.',
        'Issue verified by customer.',
        'Resolved with rollback.',
        'Temporary workaround implemented.',
        'Fix tested in staging.'
    ],
    closed: [
        'Issue closed after QA confirmation.',
        'No further action required.',
        'Closed as duplicate or invalid.',
        'Marked as won’t fix by product owner.',
        'Closed due to inactivity.',
        'Resolved and archived.',
        'Issue rejected as out of scope.',
        'Closed following user cancellation.',
        'Closed as fixed in newer version.',
        'Resolved and auto-closed.',
        'Closed after release deployment.',
        'Archived per policy.'
    ]
};

// Grouped title suffixes by issue status — pick suffix according to current/new status
const titleSuffixGroups = {
    open: [
        'needs review',
        'pending',
        'follow-up',
        'investigation',
        'awaiting input',
        'triage needed'
    ],
    in_progress: [
        'urgent',
        'escalated',
        'hotfix',
        'bugfix',
        'patch',
        'investigating',
        'in review'
    ],
    resolved: [
        'resolved',
        'fix verified',
        'QA approved',
        'ready for close',
        'patch deployed'
    ],
    closed: [
        'closed',
        'archived',
        'no action required',
        'duplicate',
        'won’t fix'
    ]
};

// Priority to allowed statuses
const priorityStatusRules = {
    critical: ['open', 'in_progress'],
    high: ['open', 'in_progress', 'resolved'],
    medium: ['open', 'in_progress', 'resolved', 'closed'],
    low: ['open', 'resolved', 'closed']
};

const suffixCleanRegex = new RegExp(
    ` - (${Object.values(titleSuffixGroups).flat().map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`,
    'i'
);

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Fetch issues and users
        const issues = await queryInterface.sequelize.query(
            'SELECT id, created_by, created_at, updated_by, updated_at, title, description, status, priority, assignee FROM issues ORDER BY id ASC',
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        const users = await queryInterface.sequelize.query(
            'SELECT id FROM users ORDER BY id ASC',
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
                changes: JSON.stringify({}), // no changes in initial revision
                updated_by: issue.updated_by || issue.created_by,
                updated_at: issue.updated_at ? new Date(issue.updated_at) : new Date(issue.created_at)
            });

            const totalRevisions = 5 + Math.floor(Math.random() * 5);

            const createdBy = issue.created_by;
            const originalAssignee = issue.assignee;
            const isSameUser = createdBy === originalAssignee;

            // Store last snapshot and last updated time to build on
            let lastSnapshot = initialSnapshot;
            let lastUpdatedAt = revisions[revisions.length - 1].updated_at;

            for (let i = 1; i < totalRevisions; i++) {
                revisionNumber = i + 1;
                const changedFields = {};

                // Handle 2nd and 3rd revision special cases
                if (i === 1) {
                    if (isSameUser) {
                        changedFields.status = 'in_progress';
                        changedFields.description = (lastSnapshot.description || '') + ' ' +
                            faker.helpers.arrayElement(descriptionFragments.in_progress);
                    } else {
                        let newAssignee;
                        do {
                            newAssignee = users[Math.floor(Math.random() * users.length)].id;
                        } while (newAssignee === createdBy);
                        changedFields.assignee = newAssignee;
                        changedFields.description = (lastSnapshot.description || '') + ' Assignee updated.';
                    }
                } else if (i === 2 && !isSameUser) { // 3rd revision
                    changedFields.status = 'in_progress';
                    changedFields.description = (lastSnapshot.description || '') + ' ' +
                        faker.helpers.arrayElement(descriptionFragments.in_progress);
                } else {
                    // Other revisions - realistic random changes with business rules

                    if (Math.random() < 0.6) {
                        const validStatuses = priorityStatusRules[lastSnapshot.priority] || ['open', 'in_progress', 'resolved', 'closed'];
                        let newStatus;

                        do {
                            newStatus = faker.helpers.arrayElement(validStatuses);

                            // Only allow closed if last status was resolved
                            if (newStatus === 'closed' && lastSnapshot.status !== 'resolved') {
                                newStatus = lastSnapshot.status; // revert and retry
                            }
                        } while (newStatus === lastSnapshot.status);

                        changedFields.status = newStatus;

                        if (newStatus === 'closed') {
                            changedFields.assignee = null;
                        }

                        changedFields.description = (lastSnapshot.description || '') + ' ' +
                            faker.helpers.arrayElement(descriptionFragments[newStatus]);
                    }

                    if (Math.random() < 0.5) {
                        const priorities = Object.keys(priorityStatusRules);
                        let newPriority;
                        do {
                            newPriority = faker.helpers.arrayElement(priorities);
                        } while (newPriority === lastSnapshot.priority);
                        changedFields.priority = newPriority;
                    }

                    // Change title with appropriate suffix from titleSuffixGroups for new or last status
                    if (Math.random() < 0.4) {
                        const baseTitle = lastSnapshot.title.replace(suffixCleanRegex, '');
                        const statusForSuffix = changedFields.status || lastSnapshot.status;
                        const suffixes = titleSuffixGroups[statusForSuffix] || ['update'];
                        const suffix = faker.helpers.arrayElement(suffixes);
                        changedFields.title = `${baseTitle} - ${suffix}`;
                    }

                    if ((changedFields.status === 'resolved') && lastSnapshot.assignee) {
                        changedFields._useAssigneeAsUpdater = true;
                    } else {
                        changedFields._useAssigneeAsUpdater = false;
                    }

                    if (Math.random() < 0.3 && (changedFields.status || lastSnapshot.status) !== 'closed') {
                        changedFields.assignee = users[Math.floor(Math.random() * users.length)].id;
                    }
                }

                const newSnapshot = { ...lastSnapshot, ...changedFields };
                delete newSnapshot._useAssigneeAsUpdater;

                const changes = deepDiff(lastSnapshot, newSnapshot);

                if (Object.keys(changes).length === 0) continue; // skip empty change

                let updatedBy;
                if (changedFields._useAssigneeAsUpdater) {
                    updatedBy = newSnapshot.assignee || users[Math.floor(Math.random() * users.length)].id;
                } else {
                    updatedBy = users[Math.floor(Math.random() * users.length)].id;
                }

                const lastUpdatedTime = lastUpdatedAt instanceof Date ? lastUpdatedAt : new Date(lastUpdatedAt);
                const updatedAt = new Date(lastUpdatedTime.getTime() + (24 * 60 * 60 * 1000) * (1 + Math.floor(Math.random() * 3)));

                revisions.push({
                    issue_id: issue.id,
                    revision_number: revisionNumber,
                    issue: JSON.stringify(newSnapshot),
                    changes: JSON.stringify(changes),
                    updated_by: updatedBy,
                    updated_at: updatedAt
                });

                // Update issues table with latest snapshot
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

                lastSnapshot = newSnapshot;
                lastUpdatedAt = updatedAt;
            }
        }

        await queryInterface.bulkInsert('revisions', revisions, {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('revisions', null, {});
    }
};