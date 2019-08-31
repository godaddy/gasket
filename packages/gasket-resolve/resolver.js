const debug = require('diagnostics')('gasket:resolver');

module.exports = class Resolver {
  constructor(opts) {
    const {
      resolveFrom,
      resolve: _resolve = require.resolve,
      require: _require = require,
      root = process.cwd()
    } = opts || {};

    this.opts = {
      resolveFrom,
      resolve: _resolve,
      require: _require,
      root
    };
  }

  /**
   * Returns the resolved filename of the module
   *
   * @param {String} moduleName name of the module
   * @returns {String} filename of the module
   * @public
   */
  resolve(moduleName) {
    const options = this.opts.resolveFrom ? { paths: [this.opts.resolveFrom] } : {};
    return this.opts.resolve(moduleName, options);
  }

  /**
   * Returns the require module
   *
   * @param {String} moduleName name of the module
   * @returns {Object} module contents
   */
  require(moduleName) {
    const modulePath = this.resolve(moduleName);
    return this.opts.require(modulePath);
  }


  tryRequire(moduleName) {
    try {
      debug('try-require require', moduleName);
      return this.require(moduleName);
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND'
        && err.message.includes(moduleName)) return null;

      debug('try-require', err.message);
      throw err;
    }
  }

  /**
   * Returns the resolved filename of the module
   *
   * @param {String} moduleName name of the module
   * @returns {String} filename of the module
   * @public
   */
  tryResolve(moduleName) {
    try {
      return this.resolve(moduleName);
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND'
        && err.message.includes(moduleName)) return null;

      debug('try-resolve', err.message);
      throw err;
    }
  }
};

