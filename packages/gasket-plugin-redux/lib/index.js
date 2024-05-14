/// <reference types="@gasket/plugin-metadata" />

const path = require('path');
const { name } = require('../package.json');
const configure = require('./configure');
const prompt = require('./prompt');
const middleware = require('./middleware');
const create = require('./create');
const webpackConfig = require('./webpack-config');

/**
 * Gasket Redux Plugin
 *
 * Adds middleware to the express server with webpack configuration
 * @type {import('@gasket/engine').Plugin}
 */
const plugin = {
  name,
  dependencies: ['@gasket/plugin-log'],
  hooks: {
    configure,
    prompt,
    create,
    webpackConfig,
    middleware,
    metadata(gasket, meta) {
      const { root, redux: reduxConfig = {} } = gasket.config;
      const { makeStore = path.join(root, 'redux', 'store.js') } = reduxConfig;
      return {
        ...meta,
        lifecycles: [
          {
            name: 'initReduxState',
            method: 'execWaterfall',
            description: 'Initializes state of the Redux store',
            link: 'README.md#initReduxState',
            parent: 'middleware'
          },
          {
            name: 'initReduxStore',
            method: 'exec',
            description: 'Plugin access to Redux store instance',
            link: 'README.md#initReduxStore',
            parent: 'middleware',
            after: 'initReduxState'
          }
        ],
        structures: [
          {
            name: path.relative(root, makeStore),
            description: 'Setup to make Redux store',
            link: 'README.md'
          }
        ],
        configurations: [
          {
            name: 'redux',
            link: 'README.md#configuration',
            description: 'Redux plugin config object',
            type: 'object'
          },
          {
            name: 'redux.makeStore',
            link: 'README.md#configuration',
            description: 'Relative path to a custom makeStore configuration',
            type: 'string',
            default: 'store.js'
          },
          {
            name: 'redux.initState',
            link: 'README.md#configuration',
            description: 'Initial state to include in the store',
            type: 'object'
          }
        ]
      };
    }
  }
};

module.exports = plugin;
