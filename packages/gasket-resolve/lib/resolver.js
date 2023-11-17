import { default as diagnostics } from 'diagnostics';
const debug = diagnostics('gasket:resolver');

/**
 * Utility to help resolve and require modules
 *
 * @type {Resolver}
 */
export class Resolver {
  /**
   * @param {object} options - Options
   * @param {string|string[]} [options.resolveFrom] - Path(s) to resolve modules from
   * @param {function} [options.require] - Require instance to use
   */
  constructor(options) {
    const {
      resolveFrom,
    } = options || {};

    if (resolveFrom) {
      this._resolveFrom = Array.isArray(resolveFrom) ? resolveFrom : [resolveFrom];
    }
    this._import = async (path, assertion) => await import(path, assertion);
  }

  /**
   * Returns the resolved module filename
   *
   * @param {string} moduleName name of the module
   * @returns {string} filename of the module
   */
  resolve(moduleName) {
    return import.meta.resolve(moduleName);
  }

  /**
   * Returns the required module
   *
   * @param {string} moduleName name of the module
   * @returns {object} module contents
   */
  require(moduleName, assertion = {}) {
    const modulePath = this.resolve(moduleName);
    return this._import(modulePath, assertion);
  }

  /**
   * Returns the resolved module filename, or null if not found
   *
   * @param {string} moduleName name of the module
   * @returns {string|null} filename of the module
   */
  tryResolve(moduleName) {
    try {
      debug('try-resolve', moduleName);
      return this.resolve(moduleName);
    } catch (err) {
      debug('try-resolve error', err.message);
      if (err.code === 'MODULE_NOT_FOUND' && err.message.includes(moduleName) ||
        err.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED'
      ) return null;

      throw err;
    }
  }

  /**
   * Returns the required module, or null if not found
   *
   * @param {string} moduleName name of the module
   * @returns {object|null} module contents
   */
  tryRequire(moduleName) {
    try {
      debug('try-require', moduleName);
      return this.require(moduleName);
    } catch (err) {
      debug('try-require error', err.message);
      if (err.code === 'MODULE_NOT_FOUND' && err.message.includes(moduleName) ||
        err.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED'
      ) return null;

      throw err;
    }
  }
}
