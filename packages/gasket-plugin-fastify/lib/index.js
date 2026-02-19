/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-metadata" />

import createServers from './create-servers.js';
import actions from './actions.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
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
            parent: 'createServers'
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
          }
        ]
      };
    }
  }
};

export default plugin;
