const prompt = require('./prompt');
const create = require('./create');
const postCreate = require('./post-create');
const { name } = require('../package.json');

/** @type {import('@gasket/engine').Plugin} */
const plugin = {
  name,
  hooks: {
    prompt,
    create,
    postCreate
  }
};

module.exports = plugin;
