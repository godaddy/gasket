import configure from './configure.js';
import build from './build.js';
import express from './express.js';
import fastify from './fastify.js';
import composeServiceWorker from './compose-service-worker.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

export default {
  name,
  version,
  description,
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
