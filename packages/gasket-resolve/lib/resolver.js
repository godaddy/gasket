const debug = require('diagnostics')('gasket:resolver');

/**
 * Utility to help resolve and require modules
 *
 * @type {Resolver}
 */
class Resolver {
  /**
   * @param {Object} options - Options
   * @param {String|String[]} [options.resolveFrom] - Path(s) to resolve modules from
   * @param {require} [options.require] - Require instance to use
   */
  constructor(options) {
    const {
      resolveFrom,
      require: _require
    } = options || {};

    if (resolveFrom) {
      this._resolveFrom = Array.isArray(resolveFrom) ? resolveFrom : [resolveFrom];
    }
    this._require = _require || require;
  }

  /**
   * Returns the resolved filename of the module
   *
   * @param {String} moduleName name of the module
   * @returns {String} filename of the module
   */
  resolve(moduleName) {
    const options = this._resolveFrom ? { paths: this._resolveFrom } : {};
    return this._require.resolve(moduleName, options);
  }

  /**
   * Returns the require module
   *
   * @param {String} moduleName name of the module
   * @returns {Object} module contents
   */
  require(moduleName) {
    const modulePath = this.resolve(moduleName);
    return this._require(modulePath);
  }

  /**
   * Returns the resolved filename of the module
   *
   * @param {String} moduleName name of the module
   * @returns {String} filename of the module
   */
  tryResolve(moduleName) {
    try {
      debug('try-resolve', moduleName);
      return this.resolve(moduleName);
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND'
        && err.message.includes(moduleName)) return null;

      debug('try-resolve error', err.message);
      throw err;
    }
  }

  tryRequire(moduleName) {
    try {
      debug('try-require', moduleName);
      return this.require(moduleName);
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND'
        && err.message.includes(moduleName)) return null;

      debug('try-require error', err.message);
      throw err;
    }
  }
}

module.exports = Resolver;
