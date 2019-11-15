const create = require('./create');
const webpack = require('./webpack');
const getCommands = require('./get-commands');
/**
 * Gasket Analyzer Plugin
 *
 * @type {{hooks: {webpack}}}
 */
module.exports = {
  name: require('../package').name,
  hooks: {
    webpack,
    getCommands,
    create,
    metadata(gasket, meta) {
      return {
        ...meta,
        commands: [{
          name: 'analyze',
          description: 'Generate analysis report of webpack bundles',
          link: 'README.md#commands'
        }]
      };
    }
  }
};
