/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-metadata" />

const { name, version, description } = require('../package.json');
const create = require('./create');
const createServers = require('./create-servers');

// Memoize the Express app instance
let app;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions: {
    getExpressApp(gasket) {
      const express = require('express');
      const { http2 } = gasket.config;
      app ??= http2 ? require('http2-express')(express) : express();

      return app;
    }
  },
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
            link: 'README.md#getExpressApp'
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
