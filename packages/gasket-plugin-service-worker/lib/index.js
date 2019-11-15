const configure = require('./configure');
const middleware = require('./middleware');
const express = require('./express');

module.exports = {
  name: require('../package').name,
  hooks: {
    configure,
    middleware,
    express,
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [{
          name: 'composeServiceWorker',
          method: 'execWaterfall',
          description: 'Update the service worker script',
          link: 'README.md#composeServiceWorker',
          parent: 'express' // TODO: actual execution is for each request
        }]
      };
    }
  }
};
