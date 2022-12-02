/**
 * Tries to require.resolve a module, but ignores if it is not found.
 * If not found, result will be null.
 *
 * @example
 * const { tryResolve } = require('@gasket/utils');
 *
 *  let modulePath: string = tryResolve('../might/be/a/path/to/some/file');
 *
 *  if(modulePath) {
 *   modulePath = require(modulePath)
 * }
 *
 * @param {string} modulePath - Module to import
 * @param {object} options - Paths to search for the module
 * @returns {string} module path
 */
function tryResolve(modulePath, options = { paths: [] }) {
  try {
    return require.resolve(modulePath, options);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return null;
    }
    throw err;
  }
}

module.exports = tryResolve;
