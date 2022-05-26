const configure = require('./configure');
const build = require('./build');
const middleware = require('./middleware');
const express = require('./express');
const webpackConfig = require('./webpack-config');
const fastify = require('./fastify');

module.exports = {
  name: require('../package').name,
  hooks: {
    configure,
    build,
    middleware,
    express,
    fastify,
    webpackConfig,
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [
          {
            name: 'composeServiceWorker',
            method: 'execWaterfall',
            description: 'Update the service worker script',
            link: 'README.md#composeServiceWorker',
            parent: 'express'
          },
          {
            name: 'serviceWorkerCacheKey',
            method: 'exec',
            description: 'Get cache keys for request based service workers',
            link: 'README.md#serviceWorkerCacheKey',
            parent: 'express'
          }
        ]
      };
    }
  }
};
