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
    create
  }
};
