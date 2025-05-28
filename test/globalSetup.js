// test/globalSetup.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

module.exports = async () => {
    process.env.NODE_ENV = 'test';
    console.log('Global test setup completed');
};