'use strict';

const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');
// const faker = require('faker');

const COMMON_PASSWORD = 'Password123'; // Define a common password for all users
const PASSWORD_HASH_ROUNDS = 10;

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Generate password hash once
        const passwordHash = await bcrypt.hash(COMMON_PASSWORD, PASSWORD_HASH_ROUNDS);

        const users = [];

        // Known user
        users.push({
            email: 'admin@example.com',
            name: 'Admin',
            password_hash: passwordHash,
            created_at: new Date(),
            updated_at: new Date()
        });

        // 99 random users
        for (let i = 0; i < 99; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            users.push({
                email: faker.internet.email({ firstName, lastName }),
                name: firstName + ' ' + lastName,
                password_hash: passwordHash,
                created_at: faker.date.past(),
                updated_at: new Date()
            });
        }

        await queryInterface.bulkInsert('users', users, {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('users', null, {});
    }
};