/// <reference types="@gasket/plugin-express" />

const { name, version, description } = require('../package.json');
const apmTransaction = require('./apm-transaction');
const metadata = require('./metadata');
const configure = require('./configure');
const actions = require('./actions');
const { prompt } = require('./prompt');
const create = require('./create');
const { webpackConfig } = require('./webpack-config');
const express = require('./express');
const fastify = require('./fastify');
const workbox = require('./workbox');

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

module.exports = plugin;
