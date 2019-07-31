const configure = require('./configure');
const middleware = require('./middleware');
const express = require('./express');

module.exports = {
  name: 'service-worker',
  hooks: {
    configure,
    middleware,
    express
  }
};
