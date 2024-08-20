/**
 * Try to resolve a module, returning null if not found
 *
 * @param moduleName
 * @param paths
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
