import type { MaybeAsync } from '@gasket/core';


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

export default {
  name: '@gasket/plugin-logger',
  hooks: {}
};
