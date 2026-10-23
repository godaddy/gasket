/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-https" />
/// <reference types="@gasket/plugin-metadata" />

/* eslint-disable no-console */
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;
import { createChildLogger, overrideConsole, verifyLoggerLevels } from './utils.js';

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions: {
    getLogger: (gasket) => gasket.logger
  },
  hooks: {
    init(gasket) {
      const loggers = Object.entries(gasket.execMapSync('createLogger'));
      let hasCustomLogger = false;

      if (loggers.length === 0) {
        const defaultLogger = {
          debug: console.debug,
          error: console.error,
          info: console.info,
          warn: console.warn,
          child: (meta) => createChildLogger(this, meta)
        };
        gasket.logger = defaultLogger;
      } else if (loggers.length > 1) {
        throw new Error(
          `Multiple plugins are hooking createLogger: ${loggers.map(([pluginName]) => pluginName).join(', ')}. Only one logger is supported.`
        );
      } else {
        const [[, logger]] = loggers;
        verifyLoggerLevels(logger);
        gasket.logger = logger;
        hasCustomLogger = true;
      }

      if (hasCustomLogger && gasket.config?.logger?.overrideConsole) {
        overrideConsole(gasket.logger);
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
            method: 'execMapSync',
            description: 'Custom logger creation',
            link: 'README.md#createLogger',
            parent: 'init'
          }
        ]
      };
    }
  }
};

export default plugin;
