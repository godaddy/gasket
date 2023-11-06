import prompt from './prompt.js';
import create from './create.js';
import postCreate from './post-create.js';
import * as pkg from '../../../package.json' assert { type: 'json' };

/**
 * The git gasket plugin.
 *
 * @type {Object}
 * @public
 */
module.exports = {
  name: pkg.name,
  hooks: {
    prompt,
    create,
    postCreate
  }
};
