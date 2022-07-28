import diagnostics from 'diagnostics';

/**
 * Log utility for client-side usage. Displays scoped messages in the console.
 *
 * @class Log
 * @public
 */
export default class Log {
  /**
   * Setup log instances for each level.
   *
   * @param {Object} options configuration.
   * @private
   */
  constructor({ level, levels = Log.levels, namespace, prod } = {}) {
    this.namespace = Array.isArray(namespace) ? namespace : [namespace];
    this.level = ~levels.indexOf(level) ? level : 'info';

    levels.forEach(lvl => {
      this[lvl] = diagnostics(
        ['gasket', lvl, ...this.namespace].filter(Boolean).join(':'),
        { force: Boolean(prod) }
      );
    });
  }

  /**
   * Generic log function.
   *
   * @param {Array} ...args Additional arguments.
   * @returns {Log} fluent interface.
   * @public
   */
  log(...args) {
    this[this.level](...args);

    return this;
  }
}

/**
* Prefix for all messages send to fluentd.
* TODO (@swaagie) add support for sending aggregated messages.
*
* @type {String}
*/
Log.prefix = 'client';

/**
* Log levels comparable to winston's syslog levels.
* https://github.com/winstonjs/triple-beam/blob/master/config/syslog.js
*
* @type {Object}
*/
Log.levels = [
  'debug',
  'info',
  'notice',
  'warning',
  'error',
  'crit',
  'alert',
  'emerg'
];
