/**
 * Tries to require.resolve a module, but ignores if it is not found.
 * If not found, result will be null.
 * @example
 * const { tryResolve } = require('@gasket/utils');
 *
 *  let modulePath: string = tryResolve('../might/be/a/path/to/some/file');
 *
 *  if(modulePath) {
 *   modulePath = require(modulePath)
 * }
 */

/**
 * Wrapped for testing purposes
 * @private
 * @param {string} modulePath - Module to import
 * @param {object} options - Paths to search for the module
 * @returns {string} module path
 */
function resolve(modulePath, options) {
  return require.resolve(modulePath, options);
}

/**
 * @param {string} modulePath - Module to import
 * @param {object} options - Paths to search for the module
 * @returns {string} module path
 */
function tryResolve(modulePath, options) {
  try {
    return resolve(modulePath, options);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return null;
    }
    throw err;
  }
}

module.exports = {
  tryResolve,
  resolve
};
