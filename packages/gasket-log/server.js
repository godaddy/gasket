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
  constructor(options = {}) {
    this.options = options;
    this.local = !!options.local;

    this.silent = !!this.options.silent || false;
    this.level = this.options.level || (this.local ? 'debug' : 'info');
    this.spawn();
  }

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
    if (this.local) {
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
      format.label({ label: this.prefix }),
      format.json()
    );
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
   * Proxy to winston.log using the predefined level.
   *
   * @param {Mixed} ...args Info to log and any optional metadata.
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
   * @public
   */
  spawn() {
    const winston = createLogger({
      levels: config.syslog.levels,
      level: this.level,
      silent: this.silent,
      format: this.format(),
      transports: this.transports()
    });

    //
    // Create proxies per loglevel to each method in winston.
    //
    Object.keys(config.syslog.levels).forEach(level => {
      this[level] = winston[level].bind(this.winston);
    });

    return this.winston = winston;
  }
}

/**
 * Default prefix for all messages send to fluentd.
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

module.exports = Log;
