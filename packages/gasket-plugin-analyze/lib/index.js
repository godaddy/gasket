/// <reference types="@gasket/plugin-metadata" />

const create = require('./create');
const webpackConfig = require('./webpack-config');
const commands = require('./commands');
const { name } = require('../package.json');
/**
 * Gasket Analyzer Plugin
 * @type {import('@gasket/engine').Plugin}
 */
const plugin = {
  name,
  hooks: {
    webpackConfig,
    // @ts-ignore - TODO: remove ignore after @gasket/cli refactor
    commands,
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
