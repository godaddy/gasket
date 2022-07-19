const configure = require('./configure');
const build = require('./build');
const express = require('./express');
const fastify = require('./fastify');
const composeServiceWorker = require('./compose-service-worker');

module.exports = {
  name: require('../package').name,
  hooks: {
    configure,
    build,
    express,
    fastify,
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
        }],
        configurations: [{
          name: 'workbox',
          link: 'README.md#configuration',
          description: 'Workbox config object',
          type: 'object'
        }, {
          name: 'workbox.outputDir',
          link: 'README.md#configuration',
          description: 'The path to the directory in which the Workbox libraries should be copied',
          type: 'string',
          default: './build/workbox'
        }, {
          name: 'workbox.basePath',
          link: 'README.md#configuration',
          description: 'Change the default path to `/_workbox` endpoint by adding a path prefix here',
          type: 'string',
          default: ''
        }, {
          name: 'workbox.config',
          link: 'README.md#configuration',
          description: 'Any initial workbox config options which will be merged with those from any `workbox` lifecycle hooks',
          type: 'object'
        }]
      };
    }
  }
};
