'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Fetch issues and users
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

            // First revision snapshot (without audit fields)
            const initialSnapshot = {
                title: issue.title,
                description: issue.description,
                status: issue.status,
                priority: issue.priority,
                assignee: issue.assignee,
                createdBy: issue.created_by,
                createdAt: issue.created_at
            };

            revisions.push({
                issue_id: issue.id,
                revision_number: revisionNumber,
                issue_snapshot: JSON.stringify(initialSnapshot),
                changes: JSON.stringify(initialSnapshot),
                updated_by: issue.updated_by || issue.created_by,
                updated_at: issue.updated_at ? new Date(issue.updated_at) : new Date(issue.created_at)
            });

            const totalRevisions = 5 + Math.floor(Math.random() * 5);

            for (let i = 1; i < totalRevisions; i++) {
                revisionNumber++;

                const changedFields = {};

                if (Math.random() < 0.6) changedFields.status = ['open', 'in_progress', 'resolved', 'closed'][Math.floor(Math.random() * 4)];
                if (Math.random() < 0.5) changedFields.priority = ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)];
                if (Math.random() < 0.5) changedFields.description = "Updated: " + (Math.random() < 0.5 ? "Bug fixed partially." : "Investigating root cause.");
                if (Math.random() < 0.4) changedFields.title = issue.title + (Math.random() < 0.5 ? " - urgent" : " - update");
                if (Math.random() < 0.3) changedFields.assignee = Math.random() < 0.5 ? users[Math.floor(Math.random() * users.length)].id : null;

                // Merge with previous snapshot
                const lastSnapshotRaw = revisions[revisions.length - 1].issue_snapshot;
                const lastSnapshot = JSON.parse(lastSnapshotRaw);
                const newSnapshot = { ...lastSnapshot, ...changedFields };

                const updatedBy = users[Math.floor(Math.random() * users.length)].id;

                const lastUpdatedAtRaw = revisions[revisions.length - 1].updated_at;
                const lastUpdatedAt = lastUpdatedAtRaw instanceof Date ? lastUpdatedAtRaw : new Date(lastUpdatedAtRaw);
                const updatedAt = new Date(lastUpdatedAt.getTime() + (24 * 60 * 60 * 1000) * (1 + Math.floor(Math.random() * 3)));

                revisions.push({
                    issue_id: issue.id,
                    revision_number: revisionNumber,
                    issue_snapshot: JSON.stringify(newSnapshot),
                    changes: JSON.stringify(changedFields),
                    updated_by: updatedBy,
                    updated_at: updatedAt
                });
            }
        }

        await queryInterface.bulkInsert('revisions', revisions, {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('revisions', null, {});
    }
};