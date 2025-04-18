/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-metadata" />

const { name, version, description } = require('../package.json');
const create = require('./create');
const createServers = require('./create-servers');
const actions = require('./actions');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    create,
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
            parent: 'createServers',
            after: 'middleware'
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
        }, {
          name: 'express.compression',
          link: 'README.md#configuration',
          description: 'Automatic compression',
          type: 'boolean',
          default: true
        }]
      };
    }
  }
};

module.exports = plugin;
