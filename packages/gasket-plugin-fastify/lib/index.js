/// <reference types="@gasket/cli" />
/// <reference types="@gasket/plugin-metadata" />

const { peerDependencies, name } = require('../package.json');
const createServers = require('./create-servers');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  hooks: {
    create: async function create(gasket, context) {
      const generatorDir = `${__dirname}/../generator`;

      context.pkg.add('dependencies', {
        fastify: peerDependencies.fastify
      });

      if ('apiApp' in context && context.apiApp) {
        context.files.add(`${generatorDir}/**/*`);

        context.gasketConfig.add('fastify', {
          routes: []
        });
      }
    },
    createServers,
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [
          {
            name: 'middleware',
            method: 'exec',
            description: 'Add Express style middleware for Fastify',
            link: 'README.md#middleware',
            parent: 'createServers'
          },
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

module.exports = plugin;
