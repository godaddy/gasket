import type { MaybeAsync } from '@gasket/engine';


  export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

  type LogMethods = Record<LogLevel, (...args: any[]) => void>;

  export type Logger = LogMethods & {
    close?: () => MaybeAsync<any>;
    child: (meta: Record<string, any>) => Logger;
  };

declare module '@gasket/engine' {
  interface Gasket {
    logger: Logger;
  }

  export interface HookExecTypes {
    createLogger(): MaybeAsync<Logger>
  }
}