const prompt = require('./prompt');
const create = require('./create');
const postCreate = require('./post-create');
const { name, version, description } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    prompt,
    create,
    postCreate
  }
};

module.exports = plugin;
