const prompt = require('./prompt');
const create = require('./create');
const postCreate = require('./post-create');

/** @type {import('@gasket/engine').Plugin} */
const plugin = {
  name: require('../package').name,
  hooks: {
    prompt,
    create,
    postCreate
  }
};

module.exports = plugin;
