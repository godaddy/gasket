/// <reference types="create-gasket-app"/>

const create = require('./create');
const configure = require('./configure');
const commands = require('./commands');
const metadata = require('./metadata');
const docsSetup = require('./docs-setup');
const { name, version, description } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    configure,
    create,
    commands,
    metadata,
    docsSetup
  }
};

module.exports = plugin;
