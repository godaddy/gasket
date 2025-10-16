/// <reference types="@gasket/plugin-express" />

import { createRequire } from 'module';
import apmTransaction from './apm-transaction.js';
import metadata from './metadata.js';
import configure from './configure.js';
import * as actions from './actions.js';
import { prompt } from './prompt.js';
import create from './create.js';
import { webpackConfig } from './webpack-config.js';
import express from './express.js';
import fastify from './fastify.js';
import workbox from './workbox.js';

const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  dependencies: ['@gasket/plugin-webpack'],
  name,
  version,
  description,
  actions,
  hooks: {
    configure,
    webpackConfig,
    prompt,
    create,
    express,
    fastify,
    apmTransaction,
    workbox,
    metadata
  }
};

export default plugin;
