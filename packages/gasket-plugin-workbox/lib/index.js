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
        }],
        configurations: [{
          name: 'workbox',
          link: 'README.md#configuration',
          description: 'Workbox config object',
          type: 'object'
        }, {
          name: 'workbox.outputDir',
          link: 'README.md#configuration',
          description: 'path of directory to copy Workbox libraries to',
          type: 'string',
          default: './build/workbox'
        }, {
          name: 'workbox.basePath',
          link: 'README.md#configuration',
          description: 'change the default path to `/_workbox` endpoint by adding a path prefix here',
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
