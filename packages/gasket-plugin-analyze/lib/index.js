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
        }, {
          name: 'bundleAnalyzerConfig.browser',
          link: 'README.md#configuration',
          description: 'Browser/client-side config object.',
          type: 'object',
          default: '{}'
        }, {
          name: 'bundleAnalyzerConfig.browser.defaultSizes',
          link: 'README.md#configuration',
          description: 'Module sizes to show in report by default.',
          type: 'string',
          default: 'parsed'
        }, {
          name: 'bundleAnalyzerConfig.server',
          link: 'README.md#configuration',
          description: 'Server-side config object.',
          type: 'object',
          default: '{}'
        }, {
          name: 'bundleAnalyzerConfig.server.openAnalyzer',
          link: 'README.md#configuration',
          description: 'Automatically open report in default browser.',
          type: 'boolean',
          default: true
        }]
      };
    }
  }
};
