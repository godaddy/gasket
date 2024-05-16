/** @type {import('./index').tryRequire} */
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
