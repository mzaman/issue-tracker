require('dotenv').config();

module.exports = {
    development: {
        username: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'abc123456',
        database: process.env.MYSQL_DATABASE || 'issue_db',
        host: process.env.MYSQL_HOST || 'mysqldb',
        port: process.env.MYSQL_PORT || 3306,
        dialect: 'mysql'
    },
    test: {
        username: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'abc123456',
        database: process.env.MYSQL_DATABASE || 'issue_db_test',
        host: process.env.MYSQL_HOST || 'mysqldb',
        port: process.env.MYSQL_PORT || 3306,
        dialect: 'mysql'

    },
    production: {
        username: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'abc123456',
        database: process.env.MYSQL_DATABASE || 'issue_db_prod',
        host: process.env.MYSQL_HOST || 'mysqldb',
        port: process.env.MYSQL_PORT || 3306,
        dialect: 'mysql'
    }
};