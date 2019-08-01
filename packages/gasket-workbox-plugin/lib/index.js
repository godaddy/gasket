const configure = require('./configure');
const build = require('./build');
const express = require('./express');
const composeServiceWorker = require('./compose-service-worker');

module.exports = {
  name: 'workbox',
  hooks: {
    configure,
    build,
    express,
    composeServiceWorker
  }
};
