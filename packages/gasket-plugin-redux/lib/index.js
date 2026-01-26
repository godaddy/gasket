/// <reference types="@gasket/plugin-metadata" />

const path = require('path');
const { name, version, description } = require('../package.json');
const configure = require('./configure');
const middleware = require('./middleware');
const webpackConfig = require('./webpack-config');

/**
 * Gasket Redux Plugin
 *
 * Adds middleware to the express server with webpack configuration
 * @type {import('@gasket/core').Plugin}
 */
const plugin = {
  name,
  version,
  description,
  dependencies: ['@gasket/plugin-middleware'],
  hooks: {
    configure,
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
            deprecated: true,
            method: 'execWaterfall',
            description: 'Initializes state of the Redux store',
            link: 'README.md#initReduxState',
            parent: 'middleware'
          },
          {
            name: 'initReduxStore',
            deprecated: true,
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
            deprecated: true,
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
