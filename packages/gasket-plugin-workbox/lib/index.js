const configure = require('./configure');
const build = require('./build');
const express = require('./express');
const composeServiceWorker = require('./compose-service-worker');

module.exports = {
  name: require('../package').name,
  hooks: {
    configure,
    build,
    express,
    composeServiceWorker,
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [{
          name: 'workbox',
          method: 'exec',
          description: 'Setup Workbox config and options',
          link: 'README.md#workbox',
          parent: 'composeServiceWorker'
        }]
      };
    }
  }
};
