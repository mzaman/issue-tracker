'use strict';

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.bulkInsert('issues', [
            {
                title: 'Login page error',
                description: 'Users are unable to login when using special characters in their password.',
                created_by: 'admin',
                updated_by: 'admin',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                title: 'Profile picture upload fails',
                description: 'Uploading profile pictures larger than 2MB causes a server error.',
                created_by: 'developer1',
                updated_by: 'developer1',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                title: 'Notifications not sending',
                description: 'Email notifications are not sent after account creation.',
                created_by: 'qa_tester',
                updated_by: 'qa_tester',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                title: 'Slow page load on dashboard',
                description: 'Dashboard takes more than 10 seconds to load for some users.',
                created_by: 'performance_team',
                updated_by: 'performance_team',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('issues', null, {});
    }
};