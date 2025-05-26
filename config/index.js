require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'dev'}` });

module.exports = {
    // apiVersion: process.env.API_VERSION || 'v1',
    apiPrefix: process.env.API_PREFIX || '/api',

    port: process.env.NODE_LOCAL_PORT || 8080,

    mysql: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
    },
    swaggerUi: {
        port: process.env.SWAGGER_LOCAL_PORT || 5555,
    }
};