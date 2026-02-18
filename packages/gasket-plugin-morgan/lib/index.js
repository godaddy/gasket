/// <reference types="@gasket/plugin-metadata" />

import { createRequire } from 'module';
import express from './express.js';
import fastify from './fastify.js';

const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

// set log configuration in gasket.js, under `morgan` key
// configuration options: http://expressjs.com/en/resources/middleware/morgan.html
/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    express,
    fastify,
    metadata(gasket, meta) {
      return {
        ...meta,
        configurations: [
          {
            name: 'morgan',
            link: 'README.md#configuration',
            description: 'Morgan plugin configuration',
            type: 'object'
          },
          {
            name: 'morgan.format',
            link: 'README.md#configuration',
            description: 'Log format to print',
            type: 'string',
            default: 'tiny'
          },
          {
            name: 'morgan.options',
            link: 'README.md#configuration',
            description: 'Morgan options',
            type: 'object'
          }
        ]
      };
    }
  }
};

export default plugin;
