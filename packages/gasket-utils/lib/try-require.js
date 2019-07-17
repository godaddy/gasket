/**
 * Tries to require a module, but ignores if it is not found.
 * If not found, result will be null.
 *
 * @param {string} path - Module to import
 * @returns {object} module
 */
module.exports = function tryRequire(path) {
  try {
    return require(path);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return null;
    }
    throw err;
  }
};
