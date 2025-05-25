'use strict';

const { faker } = require('@faker-js/faker');

module.exports = {
    up: async (queryInterface, Sequelize) => {

        const users = await queryInterface.sequelize.query(
            'SELECT id FROM users ORDER BY id ASC',
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        const priorities = ['low', 'medium', 'high', 'critical'];

        const issuesData = [
            {
                title: 'Login button not responding on mobile',
                description: 'The login button does not trigger any action on iOS devices.',
            },
            {
                title: 'Payment gateway intermittently times out',
                description: 'Payments fail with a timeout error during peak hours.',
            },
            {
                title: 'Dashboard charts overlap on resize',
                description: 'Resizing the window causes graphs to overlap each other.',
            },
            {
                title: 'User profile picture upload fails',
                description: 'Uploading profile pictures sometimes fails with 500 error.',
            },
            {
                title: 'Search results not paginated properly',
                description: 'Search results page shows duplicate items when paginating.',
            },
            {
                title: 'Email notifications not sent for password resets',
                description: 'Users do not receive emails when requesting password resets.',
            },
            {
                title: 'Reports export CSV corrupted',
                description: 'Exported CSV files contain corrupted data when large datasets.',
            },
            {
                title: 'Two-factor authentication fails intermittently',
                description: '2FA codes sometimes rejected after correct entry.',
            },
            {
                title: 'Mobile app crashes on startup',
                description: 'App crashes immediately after opening on Android 12.',
            },
            {
                title: 'Session timeout too short',
                description: 'Users are logged out after 5 minutes of inactivity instead of 30.',
            },
            {
                title: 'File upload size limit not enforced',
                description: 'Files larger than 5MB upload successfully causing server errors.',
            },
            {
                title: 'Broken link on Terms and Conditions page',
                description: 'The "Privacy Policy" link leads to a 404 page.',
            },
            {
                title: 'Notifications delayed by up to 1 hour',
                description: 'Users report notification delays especially on weekends.',
            },
            {
                title: 'Search bar not clearing on reset',
                description: 'Reset button does not clear search input on product pages.',
            },
            {
                title: 'Slow page load on homepage',
                description: 'Homepage takes more than 10 seconds to load during peak hours.',
            },
            {
                title: 'Unable to reset password via email link',
                description: 'Password reset links expire immediately after generation.',
            },
            {
                title: 'Incorrect total price in cart summary',
                description: 'Cart summary sometimes calculates total price incorrectly.',
            },
            {
                title: 'Missing alt text on product images',
                description: 'SEO audit shows product images missing descriptive alt text.',
            },
            {
                title: 'Error 500 on order submission',
                description: 'Server error occurs intermittently when submitting orders.',
            },
            {
                title: 'Broken pagination links on blog',
                description: 'Next page links return 404 errors on blog section.',
            },
            {
                title: 'Checkout discount code not applying',
                description: 'Discount codes entered during checkout are ignored.',
            },
            {
                title: 'Incorrect user role permissions',
                description: 'Some users have permissions they should not have.',
            },
            {
                title: 'Missing email verification step',
                description: 'New users are not required to verify their email addresses.',
            },
            {
                title: 'Broken social media share buttons',
                description: 'Facebook and Twitter share buttons do not work.',
            },
            {
                title: 'Incorrect currency displayed on invoices',
                description: 'Invoices show USD instead of local currency for some users.',
            },
            {
                title: 'Search autocomplete suggestions outdated',
                description: 'Autocomplete shows old product names no longer in inventory.',
            },
            {
                title: 'Profile update page crashes on submit',
                description: 'Submitting profile updates results in server error.',
            },
            {
                title: 'Product filtering options not working',
                description: 'Filtering by size and color does not update product list.',
            },
            {
                title: 'Checkout button disabled after coupon applied',
                description: 'Users cannot proceed to payment after applying a coupon code.',
            },
            {
                title: 'Multiple failed login attempts lock account',
                description: 'Accounts are locked after 3 failed login attempts with no unlock option.',
            },
            {
                title: 'Newsletter subscription checkbox not working',
                description: 'Users cannot subscribe/unsubscribe to newsletters using the checkbox.',
            },
            {
                title: 'Incorrect order status displayed in user profile',
                description: 'Order statuses do not update correctly after shipment.',
            },
            {
                title: 'Account deletion request not processed',
                description: 'Users requesting account deletion still have active accounts.',
            },
            {
                title: 'Error messages not localized',
                description: 'System error messages always display in English regardless of locale.',
            },
            {
                title: 'Discounts not applied on gift cards',
                description: 'Gift card purchases are not eligible for discount codes.',
            }
        ];

        // Map over each issue to assign dynamic fields and generate full data for insertion
        const issues = issuesData.map(issue => {
            // Randomly pick a user ID for 'created_by'
            const createdBy = users[Math.floor(Math.random() * users.length)].id;

            // Decide if 'updated_by' will be same as 'created_by' (30% chance)
            let updatedBy;
            if (Math.random() < 0.3) {
                updatedBy = createdBy;
            } else {
                // Otherwise pick a different user for 'updated_by'
                do {
                    updatedBy = users[Math.floor(Math.random() * users.length)].id;
                } while (updatedBy === createdBy);
            }

            // Generate 'created_at' date sometime in the past 6 months
            const createdAt = faker.date.past(0.5);

            // Generate 'updated_at' date between 'created_at' and now
            // Note: faker.date.between requires an object with from/to keys
            const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

            // Assign 'assignee' with 70% chance to a random user, else null
            const assignee = Math.random() < 0.7
                ? users[Math.floor(Math.random() * users.length)].id
                : null;

            // Randomly pick a priority level for the issue
            const priority = priorities[Math.floor(Math.random() * priorities.length)];

            // Return the complete issue object ready for insertion
            return {
                ...issue,            // spread fixed title and description
                status: 'open',      // all issues are open
                priority,            // randomly assigned priority
                created_by: createdBy,
                updated_by: updatedBy,
                assignee,
                created_at: createdAt,
                updated_at: updatedAt,
            };
        });


        await queryInterface.bulkInsert('issues', issues, {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('issues', null, {});
    }
};