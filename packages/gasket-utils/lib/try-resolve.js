/**
 * Tries to require a module, but ignores if it is not found.
 * If not found, result will be null.
 *
 * @example
 * const { tryRequire } = require('@gasket/utils');
 *
 *  let someConfig = tryRequire('../might/be/a/path/to/some/file');
 *
 *  if(!someConfig) {
 *   someConfig = require('./default-config')
 * }
 *
 * @param {string} modulePath - Module to import
 * @returns {object} module
 */
function tryResolve(modulePath, paths = []) {
  try {
    return require.resolve(modulePath, { paths });
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return null;
    }
    throw err;
  }
}

module.exports = tryResolve;
