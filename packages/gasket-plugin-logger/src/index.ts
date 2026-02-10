/* eslint-disable no-console */
import type { MaybeAsync, Plugin, Gasket } from '@gasket/core';
import type { CreateContext } from 'create-gasket-app';
import type { PluginData } from '@gasket/plugin-metadata';
import packageJson from '../package.json' with { type: 'json' };
import { createChildLogger, verifyLoggerLevels } from './utils.js';

const { name, version, description } = packageJson;

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogMethods {
  error: (...args: Array<unknown>) => void;
  warn: (...args: Array<unknown>) => void;
  info: (...args: Array<unknown>) => void;
  debug: (...args: Array<unknown>) => void;
}

export interface Logger extends LogMethods {
  close?: () => MaybeAsync<unknown>;
  child: (meta: Record<string, unknown>) => Logger;
}

declare module '@gasket/core' {
  interface Gasket {
    logger: Logger;
  }

  export interface HookExecTypes {
    createLogger(): Logger;
    onSignal?(): MaybeAsync<void>;
  }

  export interface GasketActions {
    getLogger(): Logger;
  }
}

const plugin: Plugin = {
  name,
  version,
  description,
  actions: {
    getLogger: (gasket: Gasket): Logger => gasket.logger
  },
  hooks: {
    create(gasket: Gasket, context: CreateContext): void {
      const { pkg, gasketConfig } = context;
      gasketConfig.addPlugin('pluginLogger', '@gasket/plugin-logger');
      pkg.add('dependencies', {
        [name]: `^${version}`
      });
    },
    init(gasket: Gasket): void {
      // Must be sync - logger needs to be ready before other hooks run
      // eslint-disable-next-line no-sync
      const loggers = gasket.execSync('createLogger');

      if (
        loggers &&
        loggers.some((logger) => logger && logger instanceof Promise)
      ) {
        throw new Error('createLogger hooks must be synchronous');
      }

      if (!loggers || loggers.length === 0) {
        const defaultLogger: Logger = {
          debug: console.debug,
          error: console.error,
          info: console.info,
          warn: console.warn,
          child: (meta: Record<string, unknown>): Logger =>
            createChildLogger(defaultLogger, meta)
        };
        gasket.logger = defaultLogger;
      } else if (loggers.length > 1) {
        throw new Error(
          'Multiple plugins are hooking createLogger. Only one logger is supported.'
        );
      } else {
        verifyLoggerLevels(loggers[0]);
        gasket.logger = loggers[0];
      }
    },
    async onSignal(gasket: Gasket): Promise<void> {
      await gasket.logger?.close?.();
    },
    metadata(gasket: Gasket, meta: PluginData): PluginData {
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

export default plugin;
