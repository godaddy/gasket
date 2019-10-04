const create = require('./create');
const webpack = require('./webpack');
const getCommands = require('./get-commands');
/**
 * Gasket Analyzer Plugin
 *
 * @type {{hooks: {webpack}}}
 */
module.exports = {
  name: 'analyze',
  hooks: {
    webpack,
    getCommands,
    create
  }
};
