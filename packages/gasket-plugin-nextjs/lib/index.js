/// <reference types="@gasket/plugin-express" />

import apmTransaction from './apm-transaction.js';
import metadata from './metadata.js';
import configure from './configure.js';
import * as actions from './actions.js';
import { webpackConfig } from './webpack-config.js';
import express from './express.js';
import fastify from './fastify.js';
import workbox from './workbox.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

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
    express,
    fastify,
    apmTransaction,
    workbox,
    metadata
  }
};

export default plugin;
