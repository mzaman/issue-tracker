'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const issues = [
            {
                title: 'Login button not responding on mobile',
                description: 'The login button does not trigger any action on iOS devices.',
                status: 'open',
                priority: 'high',
                created_by: 1,
                updated_by: 1,
                assignee: 3,
                created_at: new Date('2025-01-10T08:00:00Z'),
                updated_at: new Date('2025-01-10T08:00:00Z')
            },
            {
                title: 'Payment gateway intermittently times out',
                description: 'Payments fail with a timeout error during peak hours.',
                status: 'in_progress',
                priority: 'critical',
                created_by: 2,
                updated_by: 4,
                assignee: 4,
                created_at: new Date('2025-01-15T09:30:00Z'),
                updated_at: new Date('2025-01-20T11:00:00Z')
            },
            {
                title: 'Dashboard charts overlap on resize',
                description: 'Resizing the window causes graphs to overlap each other.',
                status: 'resolved',
                priority: 'medium',
                created_by: 3,
                updated_by: 3,
                assignee: 5,
                created_at: new Date('2025-01-20T12:00:00Z'),
                updated_at: new Date('2025-02-01T16:00:00Z')
            },
            {
                title: 'User profile picture upload fails',
                description: 'Uploading profile pictures sometimes fails with 500 error.',
                status: 'open',
                priority: 'medium',
                created_by: 4,
                updated_by: 4,
                assignee: 6,
                created_at: new Date('2025-02-05T14:00:00Z'),
                updated_at: new Date('2025-02-05T14:00:00Z')
            },
            {
                title: 'Search results not paginated properly',
                description: 'Search results page shows duplicate items when paginating.',
                status: 'open',
                priority: 'low',
                created_by: 5,
                updated_by: 5,
                assignee: 7,
                created_at: new Date('2025-02-10T10:30:00Z'),
                updated_at: new Date('2025-02-10T10:30:00Z')
            },
            {
                title: 'Email notifications not sent for password resets',
                description: 'Users do not receive emails when requesting password resets.',
                status: 'in_progress',
                priority: 'high',
                created_by: 6,
                updated_by: 8,
                assignee: 8,
                created_at: new Date('2025-02-12T09:00:00Z'),
                updated_at: new Date('2025-02-15T11:00:00Z')
            },
            {
                title: 'Reports export CSV corrupted',
                description: 'Exported CSV files contain corrupted data when large datasets.',
                status: 'open',
                priority: 'medium',
                created_by: 7,
                updated_by: 7,
                assignee: null,
                created_at: new Date('2025-02-15T08:00:00Z'),
                updated_at: new Date('2025-02-15T08:00:00Z')
            },
            {
                title: 'Two-factor authentication fails intermittently',
                description: '2FA codes sometimes rejected after correct entry.',
                status: 'open',
                priority: 'high',
                created_by: 8,
                updated_by: 9,
                assignee: 9,
                created_at: new Date('2025-02-18T14:00:00Z'),
                updated_at: new Date('2025-02-20T10:00:00Z')
            },
            {
                title: 'Mobile app crashes on startup',
                description: 'App crashes immediately after opening on Android 12.',
                status: 'resolved',
                priority: 'critical',
                created_by: 9,
                updated_by: 10,
                assignee: 10,
                created_at: new Date('2025-02-20T07:30:00Z'),
                updated_at: new Date('2025-03-01T15:00:00Z')
            },
            {
                title: 'Session timeout too short',
                description: 'Users are logged out after 5 minutes of inactivity instead of 30.',
                status: 'open',
                priority: 'low',
                created_by: 10,
                updated_by: 10,
                assignee: 1,
                created_at: new Date('2025-02-25T09:00:00Z'),
                updated_at: new Date('2025-02-25T09:00:00Z')
            },
            {
                title: 'File upload size limit not enforced',
                description: 'Files larger than 5MB upload successfully causing server errors.',
                status: 'open',
                priority: 'high',
                created_by: 1,
                updated_by: 1,
                assignee: 2,
                created_at: new Date('2025-03-01T08:00:00Z'),
                updated_at: new Date('2025-03-02T09:00:00Z')
            },
            {
                title: 'Broken link on Terms and Conditions page',
                description: 'The "Privacy Policy" link leads to a 404 page.',
                status: 'resolved',
                priority: 'low',
                created_by: 2,
                updated_by: 3,
                assignee: 4,
                created_at: new Date('2025-03-05T10:00:00Z'),
                updated_at: new Date('2025-03-06T14:00:00Z')
            },
            {
                title: 'Notifications delayed by up to 1 hour',
                description: 'Users report notification delays especially on weekends.',
                status: 'in_progress',
                priority: 'medium',
                created_by: 3,
                updated_by: 3,
                assignee: 5,
                created_at: new Date('2025-03-07T12:00:00Z'),
                updated_at: new Date('2025-03-09T15:30:00Z')
            },
            {
                title: 'Search bar not clearing on reset',
                description: 'Reset button does not clear search input on product pages.',
                status: 'open',
                priority: 'low',
                created_by: 4,
                updated_by: 6,
                assignee: 6,
                created_at: new Date('2025-03-10T09:00:00Z'),
                updated_at: new Date('2025-03-10T09:00:00Z')
            },
            {
                title: 'Slow page load on homepage',
                description: 'Homepage takes more than 10 seconds to load during peak hours.',
                status: 'open',
                priority: 'high',
                created_by: 5,
                updated_by: 5,
                assignee: 7,
                created_at: new Date('2025-03-12T11:00:00Z'),
                updated_at: new Date('2025-03-12T11:00:00Z')
            },
            {
                title: 'Unable to reset password via email link',
                description: 'Password reset links expire immediately after generation.',
                status: 'in_progress',
                priority: 'critical',
                created_by: 6,
                updated_by: 8,
                assignee: 8,
                created_at: new Date('2025-03-14T08:30:00Z'),
                updated_at: new Date('2025-03-15T10:00:00Z')
            },
            {
                title: 'Incorrect total price in cart summary',
                description: 'Cart summary sometimes calculates total price incorrectly.',
                status: 'open',
                priority: 'medium',
                created_by: 7,
                updated_by: 7,
                assignee: 9,
                created_at: new Date('2025-03-16T10:00:00Z'),
                updated_at: new Date('2025-03-16T10:00:00Z')
            },
            {
                title: 'Missing alt text on product images',
                description: 'SEO audit shows product images missing descriptive alt text.',
                status: 'open',
                priority: 'low',
                created_by: 8,
                updated_by: 9,
                assignee: 10,
                created_at: new Date('2025-03-18T14:00:00Z'),
                updated_at: new Date('2025-03-20T16:00:00Z')
            },
            {
                title: 'Error 500 on order submission',
                description: 'Server error occurs intermittently when submitting orders.',
                status: 'in_progress',
                priority: 'high',
                created_by: 9,
                updated_by: 10,
                assignee: 1,
                created_at: new Date('2025-03-20T09:00:00Z'),
                updated_at: new Date('2025-03-22T11:00:00Z')
            },
            {
                title: 'Broken pagination links on blog',
                description: 'Next page links return 404 errors on blog section.',
                status: 'open',
                priority: 'low',
                created_by: 10,
                updated_by: 10,
                assignee: 2,
                created_at: new Date('2025-03-22T12:00:00Z'),
                updated_at: new Date('2025-03-22T12:00:00Z')
            },
            {
                title: 'Checkout discount code not applying',
                description: 'Discount codes entered during checkout are ignored.',
                status: 'open',
                priority: 'medium',
                created_by: 1,
                updated_by: 2,
                assignee: 3,
                created_at: new Date('2025-03-24T13:00:00Z'),
                updated_at: new Date('2025-03-25T14:00:00Z')
            },
            {
                title: 'Incorrect user role permissions',
                description: 'Some users have permissions they should not have.',
                status: 'in_progress',
                priority: 'high',
                created_by: 2,
                updated_by: 3,
                assignee: 4,
                created_at: new Date('2025-03-26T15:00:00Z'),
                updated_at: new Date('2025-03-27T16:00:00Z')
            },
            {
                title: 'Missing email verification step',
                description: 'New users are not required to verify their email addresses.',
                status: 'open',
                priority: 'medium',
                created_by: 3,
                updated_by: 3,
                assignee: 5,
                created_at: new Date('2025-03-28T08:00:00Z'),
                updated_at: new Date('2025-03-28T08:00:00Z')
            },
            {
                title: 'Broken social media share buttons',
                description: 'Facebook and Twitter share buttons do not work.',
                status: 'open',
                priority: 'low',
                created_by: 4,
                updated_by: 6,
                assignee: 6,
                created_at: new Date('2025-03-29T09:30:00Z'),
                updated_at: new Date('2025-03-29T09:30:00Z')
            },
            {
                title: 'Incorrect currency displayed on invoices',
                description: 'Invoices show USD instead of local currency for some users.',
                status: 'resolved',
                priority: 'medium',
                created_by: 5,
                updated_by: 7,
                assignee: 7,
                created_at: new Date('2025-03-30T10:00:00Z'),
                updated_at: new Date('2025-04-01T12:00:00Z')
            },
            {
                title: 'Search autocomplete suggestions outdated',
                description: 'Autocomplete shows old product names no longer in inventory.',
                status: 'open',
                priority: 'low',
                created_by: 6,
                updated_by: 8,
                assignee: 8,
                created_at: new Date('2025-04-02T13:00:00Z'),
                updated_at: new Date('2025-04-03T14:00:00Z')
            },
            {
                title: 'Profile update page crashes on submit',
                description: 'Submitting profile updates results in server error.',
                status: 'open',
                priority: 'high',
                created_by: 7,
                updated_by: 9,
                assignee: 9,
                created_at: new Date('2025-04-04T14:00:00Z'),
                updated_at: new Date('2025-04-05T15:00:00Z')
            },
            {
                title: 'Product filtering options not working',
                description: 'Filtering by size and color does not update product list.',
                status: 'in_progress',
                priority: 'medium',
                created_by: 8,
                updated_by: 10,
                assignee: 10,
                created_at: new Date('2025-04-06T15:00:00Z'),
                updated_at: new Date('2025-04-07T16:00:00Z')
            },
            {
                title: 'Checkout button disabled after coupon applied',
                description: 'Users cannot proceed to payment after applying a coupon code.',
                status: 'open',
                priority: 'critical',
                created_by: 9,
                updated_by: 1,
                assignee: 1,
                created_at: new Date('2025-04-08T16:00:00Z'),
                updated_at: new Date('2025-04-09T17:00:00Z')
            },
            {
                title: 'Multiple failed login attempts lock account',
                description: 'Accounts are locked after 3 failed login attempts with no unlock option.',
                status: 'in_progress',
                priority: 'high',
                created_by: 10,
                updated_by: 2,
                assignee: 2,
                created_at: new Date('2025-04-10T17:00:00Z'),
                updated_at: new Date('2025-04-11T18:00:00Z')
            },
            {
                title: 'Newsletter subscription checkbox not working',
                description: 'Users cannot subscribe/unsubscribe to newsletters using the checkbox.',
                status: 'open',
                priority: 'low',
                created_by: 1,
                updated_by: 3,
                assignee: 3,
                created_at: new Date('2025-04-12T18:00:00Z'),
                updated_at: new Date('2025-04-12T18:00:00Z')
            },
            {
                title: 'Incorrect order status displayed in user profile',
                description: 'Order statuses do not update correctly after shipment.',
                status: 'open',
                priority: 'medium',
                created_by: 2,
                updated_by: 4,
                assignee: 4,
                created_at: new Date('2025-04-13T19:00:00Z'),
                updated_at: new Date('2025-04-14T20:00:00Z')
            },
            {
                title: 'Account deletion request not processed',
                description: 'Users requesting account deletion still have active accounts.',
                status: 'in_progress',
                priority: 'high',
                created_by: 3,
                updated_by: 5,
                assignee: 5,
                created_at: new Date('2025-04-15T20:00:00Z'),
                updated_at: new Date('2025-04-16T21:00:00Z')
            },
            {
                title: 'Error messages not localized',
                description: 'System error messages always display in English regardless of locale.',
                status: 'open',
                priority: 'low',
                created_by: 4,
                updated_by: 6,
                assignee: 6,
                created_at: new Date('2025-04-17T21:00:00Z'),
                updated_at: new Date('2025-04-17T21:00:00Z')
            },
            {
                title: 'Discounts not applied on gift cards',
                description: 'Gift card purchases are not eligible for discount codes.',
                status: 'resolved',
                priority: 'medium',
                created_by: 5,
                updated_by: 7,
                assignee: 7,
                created_at: new Date('2025-04-18T22:00:00Z'),
                updated_at: new Date('2025-04-19T23:00:00Z')
            }
        ];

        await queryInterface.bulkInsert('issues', issues, {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('issues', null, {});
    }
};