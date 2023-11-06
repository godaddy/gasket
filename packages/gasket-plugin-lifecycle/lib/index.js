import * as diagnostics from 'diagnostics';
const debug = diagnostics.default.set('gasket:lifecycle');
import path from 'path';
import { readdir } from 'fs/promises';
import lodash from 'lodash';
const { camelcase: camelCase } = lodash;
import * as pkg from '../../../package.json' assert { type: 'json' };

/**
 * Resolves a given directory to valid `lifecycle` plugins.
 *
 * @param {String} root Directory we need to search.
 * @param {String} name Name of the directory that contains the lifecycles.
 * @returns {Array} Lifecycle methods.
 * @public
 */
async function resolve(root, ...parts) {
  const dir = path.join(root, ...parts);

  let files = [];
  try {
    files = await readdir(dir);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  const isJs = /\.(js|cjs)$/i;
  const isTest = /\.(spec|test)\./i;
  return files.filter(file => isJs.test(file) && !isTest.test(file))
    .map(function each(file) {
      const extname = path.extname(file);
      const event = camelCase(path.basename(file, extname));

      let hook = require(path.join(dir, file));
      debug('found %s as lifecycle for %s', file, event);

      if (typeof hook === 'function') {
        hook = {
          handler: hook
        };
      }

      return {
        pluginName: file,
        event,
        ...hook
      };
    });
}

/**
 * Register all hooks as lifecycle that are in a given directory.
 *
 * @param {Gasket} gasket Gasket/Plugin-Engine instance.
 * @public
 */
async function init(gasket) {
  const lifecycles = await Promise.all([
    resolve(gasket.config.root, 'lifecycles'),
    resolve(gasket.config.root, 'src', 'lifecycles')
  ]);

  lifecycles.reduce((acc, cur) => acc.concat(cur), [])
    .forEach(function each(cycle) {
      gasket.hook(cycle);
    });
}

/**
 * Expose the plugin.
 *
 * @public
 */
export default {
  name: pkg.name,
  hooks: {
    init,
    metadata(gasket, meta) {
      return {
        ...meta,
        structures: [{
          name: 'lifecycles/',
          description: 'JavaScript files to hook lifecycles with matching name',
          link: 'README.md'
        }]
      };
    }
  }
};
