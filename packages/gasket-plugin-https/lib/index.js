/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-metadata" />
/// <reference types="@gasket/plugin-logger" />
/// <reference types="create-gasket-app" />

const { name, version, description } = require('../package.json');
const actions = require('./actions');
const createHook = require('./create');
const configure = require('./configure');
const metadata = require('./metadata');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    create: createHook,
    configure,
    metadata
  }
};

module.exports = plugin;
