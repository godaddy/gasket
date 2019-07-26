const prompt = require('./prompt');
const create = require('./create');
const postCreate = require('./post-create');

/**
 * The git gasket plugin.
 *
 * @type {Object}
 * @public
 */
module.exports = {
  name: 'git',
  hooks: {
    prompt,
    create,
    postCreate
  }
};
