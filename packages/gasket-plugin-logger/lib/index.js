/* eslint-disable no-console */
const name = require('../package.json').name;

function createChildLogger(parent, metadata) {
  return {
    ...parent,
    debug: (...args) => console.debug(...args, metadata),
    error: (...args) => console.error(...args, metadata),
    info: (...args) => console.info(...args, metadata),
    warn: (...args) => console.warn(...args, metadata),
    child(meta) {
      return createChildLogger(this, { ...metadata, ...meta });
    }
  };
}

function verifyLoggerLevels(logger) {
  const levels = ['debug', 'error', 'info', 'warn', 'child'];
  levels.forEach((level) => {
    if (typeof logger[level] !== 'function') {
      throw new Error(`Logger is missing required level: ${level}`);
    }
  });
}

module.exports = {
  name,
  hooks: {
    async init(gasket) {
      const loggers = await gasket.exec('createLogger');

      if (!loggers || loggers.length === 0) {
        // Handle the case where loggers is undefined or empty array
        gasket.logger = {
          debug: console.debug,
          error: console.error,
          info: console.info,
          warn: console.warn,
          child(meta) {
            return createChildLogger(this, meta);
          }
        };
      } else if (loggers.length > 1) {
        throw new Error(
          'Multiple plugins are hooking createLogger. Only one logger is supported.'
        );
      } else {
        // Verify that the logger has the required levels
        verifyLoggerLevels(loggers[0]);

        // Set the logger to the first element of loggers array
        gasket.logger = loggers[0];
      }
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
            method: 'exec',
            description: 'Custom logger creation',
            link: 'README.md#createLogger',
            parent: 'init'
          }
        ]
      };
    }
  }
};
