'use strict';

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.bulkInsert('revisions', [
            {
                issue_id: 1,
                revision_data: JSON.stringify({
                    title: 'Login page error',
                    description: 'Users cannot login using special characters.'
                }),
                changes: JSON.stringify({ description: 'Initial report' }),
                updated_at: new Date()
            },
            {
                issue_id: 2,
                revision_data: JSON.stringify({
                    title: 'Profile picture upload fails',
                    description: 'Error when uploading pictures > 2MB.'
                }),
                changes: JSON.stringify({ description: 'Initial report' }),
                updated_at: new Date()
            },
            {
                issue_id: 2,
                revision_data: JSON.stringify({
                    title: 'Profile picture upload fails',
                    description: 'Fixed image size validation.'
                }),
                changes: JSON.stringify({ description: 'Added image size validation' }),
                updated_at: new Date()
            },
            {
                issue_id: 3,
                revision_data: JSON.stringify({
                    title: 'Notifications not sending',
                    description: 'Email notifications failing due to SMTP timeout.'
                }),
                changes: JSON.stringify({ description: 'Identified SMTP timeout issue' }),
                updated_at: new Date()
            }
        ]);
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('revisions', null, {});
    }
};