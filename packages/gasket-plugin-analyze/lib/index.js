/* eslint-disable spaced-comment */
/// <reference types="@gasket/plugin-webpack" />
/// <reference types="@gasket/plugin-command" />
/// <reference types="@gasket/plugin-metadata" />
/// <reference types="@gasket/cli" />

/**
 * @typedef {import('./index')} Plugin
 */

const create = require('./create');
const webpackConfig = require('./webpack-config');
const getCommands = require('./get-commands');
const { name } = require('../package.json');

/**
 * Plugin definition
 * @type {Plugin}
 */
const plugin = {
  name,
  hooks: {
    webpackConfig,
    getCommands,
    create,
    metadata(gasket, meta) {
      return {
        ...meta,
        commands: [
          {
            name: 'analyze',
            description: 'Generate analysis report of webpack bundles',
            link: 'README.md#commands'
          }
        ],
        configurations: [
          {
            name: 'bundleAnalyzerConfig',
            link: 'README.md#configuration',
            description:
              'Tune both browser and server Webpack analysis reports',
            type: 'object'
          }
        ]
      };
    }
  }
};

module.exports = plugin;
