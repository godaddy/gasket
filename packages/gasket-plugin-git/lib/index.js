const prompt = require('./prompt');
const create = require('./create');
const postCreate = require('./post-create');
const attachGitignore = require('./attach-gitignore');

/**
 * The git gasket plugin.
 *
 * @type {Object}
 * @public
 */
module.exports = {
  name: require('../package').name,
  hooks: {
    attachGitignore,
    prompt,
    create,
    postCreate
  }
};
