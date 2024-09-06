/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-metadata" />

const {
  name,
  version,
  description
} = require('../package.json');
const create = require('./create');
const createServers = require('./create-servers');
const fastify = require('fastify');
const { alignLogger } = require('./utils');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions: {
    getFastifyApp(gasket) {
      const { fastify: { trustProxy = false }, http2, https } = gasket.config;
      const fastifyLogger = alignLogger(gasket.logger);

      // @ts-ignore
      return fastify({ logger: fastifyLogger, trustProxy, https, http2 });
    }
  },
  hooks: {
    create,
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
