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
 * @param {string} path - Module to import
 * @returns {object} module
 */
function tryRequire(path) {
  try {
    return require(path);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return null;
    }
    throw err;
  }
}

module.exports = tryRequire;
