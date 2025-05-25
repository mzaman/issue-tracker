'use strict';

const respond = require('../../utils/responses');

module.exports = (context) => {
  respond.success(context, {
    message: 'OK',
    version: '1.0.0'
  });
};
