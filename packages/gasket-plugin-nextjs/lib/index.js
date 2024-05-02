const { name } = require('../package.json');
const apmTransaction = require('./apm-transaction');
const metadata = require('./metadata');
const configure = require('./configure');
const prompt = require('./prompt');
const create = require('./create');
const middleware = require('./middleware');
const express = require('./express');
const fastify = require('./fastify');
const build = require('./build');
const workbox = require('./workbox');

/** @type {import('@gasket/engine').Plugin} */
const plugin = {
  dependencies: ['@gasket/plugin-webpack'],
  name,
  hooks: {
    configure,
    prompt,
    create,
    middleware,
    express,
    fastify,
    apmTransaction,
    build,
    workbox,
    metadata
  }
};

module.exports = plugin;
