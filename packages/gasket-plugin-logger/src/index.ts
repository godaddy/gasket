/* eslint-disable no-console */
/* eslint-disable spaced-comment */

///<reference types="@gasket/plugin-command"/>
///<reference types="@gasket/plugin-https"/>
///<reference types="@gasket/plugin-metadata"/>

import type { MaybeAsync, Plugin } from '@gasket/engine';
import { name } from '../package.json';

namespace plugin {
  export type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug';

  type LogMethods = Record<LogLevel, (...args: any[]) => void>;

  export type Logger = LogMethods & {
    close?: () => MaybeAsync<any>;
    child: (meta: Record<string, any>) => Logger;
  };
}

declare module '@gasket/engine' {
  interface Gasket {
    logger: plugin.Logger;
  }

  interface HookExecTypes {
    createLogger: () => MaybeAsync<plugin.Logger>;
  }
}

function createChildLogger(
  parent: plugin.Logger,
  metadata: Record<string, any>
): plugin.Logger {
  return {
    ...parent,
    error: (...args) => console.error(...args, metadata),
    warn: (...args) => console.warn(...args, metadata),
    info: (...args) => console.info(...args, metadata),
    verbose: (...args) => console.info(...args, metadata),
    debug: (...args) => console.debug(...args, metadata),
    child(meta: Record<string, any>) {
      return createChildLogger(this, { ...metadata, ...meta });
    }
  };
}

const plugin: Plugin = {
  name,
  hooks: {
    async init(gasket) {
      const loggers = await gasket.exec('createLogger');
      if (loggers.length > 1) {
        throw new Error('Multiple plugins are hooking createLogger. Only one logger is supported.');
      }

      gasket.logger = loggers[0] ?? {
        error: console.error,
        warn: console.warn,
        info: console.info,
        verbose: console.log,
        debug: console.debug,
        child(meta) {
          return createChildLogger(this, meta);
        }
      };
    },

    async onSignal(gasket) {
      await gasket.logger?.close?.();
    },

    metadata(_gasket, meta) {
      return {
        ...meta,
        lifecycles: [{
          name: 'createLogger',
          method: 'exec',
          description: 'Custom logger creation',
          link: 'README.md#createLogger',
          parent: 'init'
        }]
      };
    }
  }
};

export = plugin;
