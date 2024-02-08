/* eslint-disable no-console */
const name = require('../package.json').name;

function createChildLogger(parent, metadata) {
  return {
    ...parent,
    error: (...args) => console.error(...args, metadata),
    warn: (...args) => console.warn(...args, metadata),
    info: (...args) => console.info(...args, metadata),
    verbose: (...args) => console.info(...args, metadata),
    debug: (...args) => console.debug(...args, metadata),
    child(meta) {
      return createChildLogger(this, { ...metadata, ...meta });
    }
  };
}

module.exports = {
  name,
  hooks: {
    async init(gasket) {
      const loggers = await gasket.exec('createLogger');

      if (!loggers || loggers.length === 0) {
        // Handle the case where loggers is undefined or empty array
        gasket.logger = {
          error: console.error,
          warn: console.warn,
          info: console.info,
          verbose: console.log,
          debug: console.debug,
          child(meta) {
            return createChildLogger(this, meta);
          }
        };
      } else if (loggers.length > 1) {
        throw new Error(
          'Multiple plugins are hooking createLogger. Only one logger is supported.'
        );
      } else {
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
