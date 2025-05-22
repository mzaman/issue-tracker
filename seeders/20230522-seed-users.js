'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
    up: async (queryInterface) => {
        const passwordHash = await bcrypt.hash('password123', 10);
        await queryInterface.bulkInsert('users', [
            {
                email: 'admin@example.com',
                password_hash: passwordHash,
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('users', null, {});
    }
};