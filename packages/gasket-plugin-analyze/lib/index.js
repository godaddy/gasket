const create = require('./create');
const webpackConfig = require('./webpack-config');
const getCommands = require('./get-commands');
/**
 * Gasket Analyzer Plugin
 *
 * @type {{hooks: {webpack}}}
 */
module.exports = {
  name: require('../package').name,
  hooks: {
    webpackConfig,
    getCommands,
    create,
    metadata(gasket, meta) {
      return {
        ...meta,
        commands: [{
          name: 'analyze',
          description: 'Generate analysis report of webpack bundles',
          link: 'README.md#commands'
        }],
        configurations: [{
          name: 'bundleAnalyzerConfig',
          link: 'README.md#configuration',
          description: 'This plugin utilizes [webpack-bundle-analyzer] for tuning for both `browser` and `server` analysis reports',
          type: 'object',
          default: '{}'
        }]
      };
    }
  }
};
