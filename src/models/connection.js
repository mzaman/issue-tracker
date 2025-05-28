'use strict';

const config = require('../../config');
const { Sequelize } = require('sequelize');

// Create a Sequelize instance
module.exports = new Sequelize(
    config.mysql.database,
    config.mysql.user,
    config.mysql.password,
    {
        host: config.mysql.host,
        port: config.mysql.port,
        dialect: config.mysql.dialect,
        // logging: false,
        logging: process.env.NODE_ENV === 'production', // Disable SQL logs during tests
        pool: {
            max: 10,
            min: 0
        }
    }
);

// Export named sequelize instance
// module.exports = { sequelize };