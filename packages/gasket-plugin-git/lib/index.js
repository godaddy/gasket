import prompt from './prompt.js';
import create from './create.js';
import postCreate from './post-create.js';
import { default as pkg } from '../package.json' assert { type: 'json' };

/**
 * The git gasket plugin.
 *
 * @type {Object}
 * @public
 */
export const hooks = {
  name: pkg.name,
  hooks: {
    prompt,
    create,
    postCreate
  }
};
