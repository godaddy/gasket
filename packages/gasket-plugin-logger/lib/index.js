/* eslint-disable no-console, no-sync */
const { name, version, description } = require('../package.json');

function createChildLogger(parent, metadata) {
  return {
    ...parent,
    debug: (...args) => console.debug(...args, metadata),
    error: (...args) => console.error(...args, metadata),
    info: (...args) => console.info(...args, metadata),
    warn: (...args) => console.warn(...args, metadata),
    fatal: (...args) => console.error(...args, metadata),
    trace: (...args) => console.trace(...args, metadata),
    child: (meta) => createChildLogger(this, { ...metadata, ...meta })
  };
}

function verifyLoggerLevels(logger) {
  ['debug', 'error', 'info', 'warn', 'child', 'fatal', 'trace'].forEach((level) => {
    if (typeof logger[level] !== 'function') {
      throw new Error(`Logger is missing required level: ${level}`);
    }
  });
}

module.exports = {
  name,
  version,
  description,
  hooks: {
    create(gasket, { pkg, gasketConfig }) {
      gasketConfig.addPlugin('pluginLogger', '@gasket/plugin-logger');
      pkg.add('dependencies', {
        [name]: `^${version}`
      });
    },
    init(gasket) {
      // eslint-disable-next-line no-sync
      const loggers = gasket.execSync('createLogger');

      if (loggers && loggers.some((logger) => logger && logger instanceof Promise)) {
        throw new Error('createLogger hooks must be synchronous');
      }

      if (!loggers || loggers.length === 0) {
        gasket.logger = {
          debug: console.debug,
          error: console.error,
          info: console.info,
          warn: console.warn,
          fatal: console.error,
          trace: console.trace,
          child: (meta) => createChildLogger(this, meta)
        };
      } else if (loggers.length > 1) {
        throw new Error(
          'Multiple plugins are hooking createLogger. Only one logger is supported.'
        );
      } else {
        verifyLoggerLevels(loggers[0]);
        gasket.logger = loggers[0];
      }
    },
    actions(gasket) {
      return {
        getLogger: () => gasket.logger
      };
    },
    async onSignal(gasket) {
      await gasket.logger?.close?.();
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [
          {
            name: 'createLogger',
            method: 'execSync',
            description: 'Custom logger creation',
            link: 'README.md#createLogger',
            parent: 'init'
          }
        ]
      };
    }
  }
};
