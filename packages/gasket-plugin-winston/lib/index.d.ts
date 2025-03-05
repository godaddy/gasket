import type { MaybeAsync, Plugin } from '@gasket/core';
import type { LoggerOptions, LeveledLogMethod } from 'winston';

declare module 'winston' {
  export interface Logger {
    fatal: LeveledLogMethod,
    warn: LeveledLogMethod,
    trace: LeveledLogMethod
  }
}

declare module '@gasket/core' {
  export interface GasketConfig {
    winston?: Partial<Pick<LoggerOptions, 'level' | 'transports' | 'silent' | 'levels' | 'format'>>;
  }

  export interface HookExecTypes {
    winstonTransports(): MaybeAsync<LoggerOptions['transports']>;
  }
}

declare const plugin: Plugin;

export default plugin;
