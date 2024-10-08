const create = require('./create');
const configure = require('./configure');
const commands = require('./commands');
const metadata = require('./metadata');
const docsSetup = require('./docs-setup');
const webpackConfig = require('./webpack-config');
const prompt = require('./prompt');
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
    prompt,
    docsSetup,
    webpackConfig
  }
};

module.exports = plugin;
