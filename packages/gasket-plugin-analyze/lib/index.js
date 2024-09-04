/// <reference types="@gasket/plugin-metadata" />

const create = require('./create');
const webpackConfig = require('./webpack-config');
const { name, version, description } = require('../package.json');
/**
 * Gasket Analyzer Plugin
 * @type {import('@gasket/core').Plugin}
 */
const plugin = {
  name,
  version,
  description,
  hooks: {
    webpackConfig,
    create,
    metadata(gasket, meta) {
      return {
        ...meta,
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
