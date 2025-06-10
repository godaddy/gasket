/**
 * Try to resolve a module, returning null if not found
 * @param {string} moduleName - The name of the module to resolve
 * @param {string[]} paths - Array of paths to search for the module
 * @returns {string|null} The resolved module path or null if not found
 */
function tryResolve(moduleName, paths) {
  try {
    return require.resolve(moduleName, { paths });
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') return null;
    throw err;
  }
}

module.exports = tryResolve;
