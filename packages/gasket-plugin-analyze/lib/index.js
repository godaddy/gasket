const create = require('./create');
const webpackConfig = require('./webpack-config');
const commands = require('./commands');
/**
 * Gasket Analyzer Plugin
 *
 * @type {{hooks: {webpack}}}
 */
module.exports = {
  name: require('../package').name,
  hooks: {
    webpackConfig,
    commands,
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
          description: 'Tune both browser and server Webpack analysis reports',
          type: 'object'
        }]
      };
    }
  }
};
