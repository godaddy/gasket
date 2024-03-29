const { format, transports, createLogger, config } = require('winston');
const { SPLAT } = require('triple-beam');
const kuler = require('kuler');

/**
 * Regular expression for the redux logger format.
 * @type {Object}
 */
const patterns = {
  token: /%c(.+?)((?:%c)|$)/g,
  dye: /color: #([0-9A-Z]+);?/
};

/**
 * Color formatter for Winston based on redux-logger metadata.
 *
 * @param {Object} info log information.
 * @returns {Object} info
 * @private
 */
const reduxLogger = format(function reduxLogger(info, options = {}) {
  if (!~info.message.indexOf('%c')) return info;

  const { token = patterns.token, dye = patterns.dye } = options;
  const style = info[SPLAT] && (info[SPLAT][0].match(dye) || [])[1] || '#AAA';

  //
  // Replace all occurences of [%c]...[%c]? from the message with bash color codes.
  //
  let match;
  while (match = token.exec(info.message)) {
    info.message = info.message.replace(match[0], kuler(match[1], style));
  }

  // Remove the color metadata from the SPLAT
  if (info[SPLAT]) info[SPLAT].shift();

  return info;
});

/**
 * Log instance that tracks fluentd connections and sets up a winston logger.
 *
 * @class Log
 * @public
 */
class Log {
  /**
   *
   * @param {object} [options] - Options
   * @param {string} [options.level] - Default level to use
   * @param {boolean} [options.silent] - Should logs be silenced
   * @param {boolean} [options.local] - Is this for the local development
   * @param {string} [options.prefix] - Message prefix to use
   */
  constructor(options = {}) {
    /** @private */
    this.options = options;
    /** @private */
    this.local = !!options.local;

    /** @private */
    this.silent = !!this.options.silent || false;
    /** @private */
    this.level = this.options.level || (this.local ? 'debug' : 'info');
    this.spawn();
  }

  /**
   * Get the prefix
   * @returns {string} prefix
   * @private
   */
  get prefix() {
    return this.options.prefix || Log.prefix;
  }

  /**
   * Combine log formatters based on environment.
   * TODO (@swaagie) this might need a k8 pod label as well
   *
   * @returns {Object} Combined formats.
   * @private
   */
  format() {
    return this.options.format || Log.getDefaultFormat(this.local, this.prefix);
  }

  /**
   * Return winston transports based on environment.
   *
   * @returns {Array} transports
   * @private
   */
  transports() {
    const { transports: userDefined } = this.options;
    if (Array.isArray(userDefined) && userDefined.length) {
      return userDefined;
    }

    return [new transports.Console()];
  }

  /**
   * Return the configured levels
   *
   * @returns {Object.<string,number>} levels
   * @private
   */
  get levels() {
    return this.options.levels || Log.levels;
  }

  /**
   * Default level logging.
   *
   * @param {*} args Info to log and any optional metadata.
   * @returns {Log} fluent interface.
   * @public
   */
  log(...args) {
    this.winston.log(this.level, ...args);

    return this;
  }

  /**
   * Wait for the 'finish' event to be emitted from the Writable
   * stream (i.e the winston logger). This will allow all underlying
   * Transports to gracefully close any open resources.
   *
   * @returns {Promise} Resolve on connection close.
   * @public
   */
  close() {
    return new Promise((resolve) => {
      this.winston.once('finish', () => resolve());
      this.winston.end();
    });
  }

  /**
   * Create a new Winston logger with a generated configuration.
   *
   * @returns {Winston} Logger.
   * @private
   */
  spawn() {
    const levels = this.levels;
    Log.ensureMinimalLevels(levels);
    const winston = createLogger({
      levels,
      level: this.level,
      silent: this.silent,
      format: this.format(),
      transports: this.transports()
    });

    //
    // Create proxies per loglevel to each method in winston.
    //
    Object.keys(levels).forEach(level => {
      this[level] = winston[level].bind(winston);
    });

    /** @private */
    return this.winston = winston;
  }
}

/**
 * Default prefix for all messages.
 *
 * @type {String}
 */
Log.prefix = 'server';

/**
 * Reference to Console Transport class.
 *
 * @type {TransportConsole}
 */
Log.Console = transports.Console;

//
// Expose custom color transform.
//
Log.format = {
  color: reduxLogger
};

Log.levels = { ...config.syslog.levels };

/**
 * Ensure all the expected levels utilized by Gasket plugins are set
 *
 * @param {Object.<string,number>} levels - Levels to check
 */
Log.ensureMinimalLevels = function ensureMinimalLevels(levels) {
  const missingLevels = Object.keys(Log.levels).filter(
    lvl => !Object.prototype.hasOwnProperty.call(levels, lvl));
  if (missingLevels.length > 0) {
    throw new Error(`'levels' is missing necessary levels: ${ missingLevels.join(', ') }`);
  }
};

Log.getDefaultFormat = function getDefaultFormat(local, prefix) {
  if (local) {
    return format.combine(
      reduxLogger(),
      format.colorize(),
      format.splat(),
      format.simple()
    );
  }

  //
  // Remark (@indexzero): in the event that redux logging is not
  // turned off (i.e. configureMakeStore({ reducers })) AND level
  // is manually set to 'debug' not having `inlineColors` here
  // may cause issues.
  //
  return format.combine(
    format.splat(),
    format.label({ label: prefix }),
    format.json()
  );
};

module.exports = Log;
