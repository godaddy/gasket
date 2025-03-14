import type { MaybeAsync, Plugin, Hook, HookId } from '@gasket/core';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type LogMethods = Record<LogLevel, (...args: any[]) => void>;

export interface Logger extends LogMethods {
  close?: () => MaybeAsync<any>;
  child: (meta: Record<string, any>) => Logger;
}

export function createChildLogger(
  parent: {
    [K in HookId]?: Hook<K>;
  },
  metadata: Record<string, any>
): Logger;

export function verifyLoggerLevels(logger: Logger): void;

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

declare const plugin: Plugin;

export default plugin;
