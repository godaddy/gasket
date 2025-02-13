import type { MaybeAsync, Plugin, Hook, HookId } from '@gasket/core';
import type { Logger } from '@gasket/plugin-logger';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type LogMethods = Record<LogLevel, (...args: any[]) => void>;

export function createChildLogger(
  parent: {
    [K in HookId]?: Hook<K>;
  },
  metadata: Record<string, any>
): Logger;

export function verifyLoggerLevels(logger: Logger): void;

declare module '@gasket/plugin-logger' {
  export interface Logger extends LogMethods {
    close?: () => MaybeAsync<any>;
    child: (meta: Record<string, any>) => Logger;
  }
}

declare module '@gasket/core' {
  interface Gasket {
    logger: Logger;
  }

  export interface HookExecTypes {
    createLogger(): Logger;
  }

  export interface GasketActions {
    getLogger(): Logger;
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-logger',
  hooks: {}
};

export = plugin;
