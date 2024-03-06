const create = require('./create');
const webpackConfig = require('./webpack-config');
const getCommands = require('./get-commands');
const { name } = require('../package.json');

/**
 * Gasket Analyzer Plugin
 * @type {import('@gasket/engine').Plugin}
 */
module.exports = {
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
