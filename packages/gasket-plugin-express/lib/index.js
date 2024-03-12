/// <reference types="@gasket/plugin-metadata" />

const { name } = require('../package.json');
const create = require('./create');
const createServers = require('./create-servers');

/** @type {import('@gasket/engine').Plugin} */
const plugin = {
  name,
  hooks: {
    create,
    createServers,
    metadata(gasket, meta) {
      return {
        ...meta,
        guides: [
          {
            name: 'Express Setup Guide',
            description: 'Adding middleware and routes for Express',
            link: 'docs/setup.md'
          }
        ],
        lifecycles: [
          {
            name: 'middleware',
            method: 'exec',
            description: 'Add Express style middleware',
            link: 'README.md#middleware',
            parent: 'createServers'
          },
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
        }, {
          name: 'express.routes',
          link: 'README.md#configuration',
          description: 'Glob pattern for route setup code',
          type: 'string'
        }, {
          name: 'express.excludedRoutesRegex',
          link: 'README.md#configuration',
          description: 'Routes to be included for Gasket middleware, based on a regex',
          deprecated: true,
          type: 'RegExp'
        }, {
          name: 'express.middlewareInclusionRegex',
          link: 'README.md#configuration',
          description: 'Routes to be included for Gasket middleware, based on a regex',
          type: 'RegExp'
        }]
      };
    }
  }
};

module.exports = plugin;
