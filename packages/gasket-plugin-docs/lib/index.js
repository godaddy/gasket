const create = require('./create');
const configure = require('./configure');
const getCommands = require('./get-commands');
const metadata = require('./metadata');
const docsSetup = require('./docs-setup');
const { name } = require('../package.json');

/** @type {import('@gasket/engine').Plugin} */
const plugin = {
  name,
  hooks: {
    configure,
    create,
    getCommands,
    metadata,
    docsSetup
  }
};

module.exports = plugin;
