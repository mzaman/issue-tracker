module.exports = {
    // apiVersion: process.env.API_VERSION || 'v1',
    apiPrefix: process.env.API_PREFIX || '/api',

    port: process.env.PORT,
    mysql: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    }
};