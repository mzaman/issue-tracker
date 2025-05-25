'use strict';

require('dotenv').config();
const jwt = require('jsonwebtoken');

const payload = {
    email: 'masud.zmn@gmail.com',
    role: 'applicant'
};

const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretkey123', {
    expiresIn: '2h'
});

console.log('Generated JWT:\n', token);