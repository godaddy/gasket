import type { MaybeAsync, Plugin } from '@gasket/core';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

type LogMethods = Record<LogLevel, (...args: any[]) => void>;

export type Logger = LogMethods & {
  close?: () => MaybeAsync<any>;
  child: (meta: Record<string, any>) => Logger;
};

declare module '@gasket/core' {
  interface Gasket {
    logger: Logger;
  }

  export interface HookExecTypes {
    createLogger(): Logger
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-logger',
  hooks: {}
};

export = plugin;
