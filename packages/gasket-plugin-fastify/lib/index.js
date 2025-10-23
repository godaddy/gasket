/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-metadata" />

import { createRequire } from 'node:module';
import create from './create.js';
import createServers from './create-servers.js';
import actions from './actions.js';

const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

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
            name: 'getFastifyApp',
            description: 'Get the Fastify app instance',
            link: 'README.md#getFastifyApp',
            deprecated: true
          }
        ],
        lifecycles: [
          {
            name: 'fastify',
            method: 'exec',
            description: 'Modify the Fastify instance to for adding endpoints',
            link: 'README.md#express',
            parent: 'createServers',
            after: 'middleware'
          },
          {
            name: 'errorMiddleware',
            method: 'exec',
            description:
              'Add Express style middleware for handling errors with Fastify',
            link: 'README.md#errorMiddleware',
            parent: 'createServers',
            after: 'express'
          }
        ],
        configurations: [
          {
            name: 'fastify',
            link: 'README.md#configuration',
            description: 'Fastify configuration object',
            type: 'object'
          },
          {
            name: 'fastify.compression',
            link: 'README.md#configuration',
            description: 'Automatic compression',
            type: 'boolean',
            default: true
          },
          {
            name: 'fastify.excludedRoutesRegex',
            link: 'README.md#configuration',
            description: 'Routes to be excluded based on a regex',
            type: 'RegExp'
          }
        ]
      };
    }
  }
};

export default plugin;
