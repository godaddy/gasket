/// <reference types="@gasket/plugin-metadata" />

import createServers from './create-servers.js';
import actions from './actions.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
export default {
  name,
  version,
  description,
  actions,
  hooks: {
    createServers,
    metadata(gasket, meta) {
      return {
        ...meta,
        actions: [
          {
            name: 'getExpressApp',
            description: 'Get the Express app instance',
            link: 'README.md#getExpressApp',
            deprecated: true
          }
        ],
        guides: [
          {
            name: 'Express Setup Guide',
            description: 'Adding middleware and routes for Express',
            link: 'docs/setup.md'
          }
        ],
        lifecycles: [
          {
            name: 'express',
            method: 'exec',
            description: 'Modify the Express instance to for adding endpoints',
            link: 'README.md#express',
            parent: 'createServers'
          },
          {
            name: 'errorMiddleware',
            method: 'exec',
            description: 'Add Express style middleware for handling errors',
            link: 'README.md#errorMiddleware',
            parent: 'createServers',
            after: 'express'
          }
        ],
        configurations: [{
          name: 'express',
          link: 'README.md#configuration',
          description: 'Express plugin configuration',
          type: 'object'
        }]
      };
    }
  }
};
