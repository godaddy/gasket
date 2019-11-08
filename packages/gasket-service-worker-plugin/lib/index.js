const configure = require('./configure');
const middleware = require('./middleware');
const express = require('./express');

module.exports = {
  name: require('../package').name,
  hooks: {
    configure,
    middleware,
    express
  }
};
