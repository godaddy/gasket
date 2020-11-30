const configure = require('./configure');
const build = require('./build');
const middleware = require('./middleware');
const express = require('./express');
const webpack = require('./webpack');

module.exports = {
  name: require('../package').name,
  hooks: {
    configure,
    build,
    middleware,
    express,
    webpack,
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [{
          name: 'composeServiceWorker',
          method: 'execWaterfall',
          description: 'Update the service worker script',
          link: 'README.md#composeServiceWorker',
          parent: 'express'
        }, {
          name: 'serviceWorkerCacheKey',
          method: 'exec',
          description: 'Get cache keys for request based service workers',
          link: 'README.md#serviceWorkerCacheKey',
          parent: 'express'
        }]
      };
    }
  }
};
