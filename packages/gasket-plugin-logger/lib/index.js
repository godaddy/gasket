/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-https" />
/// <reference types="@gasket/plugin-metadata" />

/* eslint-disable no-console */
const { name, version, description } = require('../package.json');
const { createChildLogger, verifyLoggerLevels } = require('./utils');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions: {
    getLogger: (gasket) => gasket.logger
  },
  hooks: {
    create(gasket, { pkg, gasketConfig }) {
      gasketConfig.addPlugin('pluginLogger', '@gasket/plugin-logger');
      pkg.add('dependencies', {
        [name]: `^${version}`
      });
    },
    init(gasket) {
      const loggers = gasket.execSync('createLogger');

      if (
        loggers &&
        loggers.some((logger) => logger && logger instanceof Promise)
      ) {
        throw new Error('createLogger hooks must be synchronous');
      }

      if (!loggers || loggers.length === 0) {
        gasket.logger = {
          debug: console.debug,
          error: console.error,
          info: console.info,
          warn: console.warn,
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
    async onSignal(gasket) {
      await gasket.logger?.close?.();
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        actions: [
          {
            name: 'getLogger',
            description: 'Get the logger instance',
            link: 'README.md#getLogger'
          }
        ],
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

module.exports = plugin;
