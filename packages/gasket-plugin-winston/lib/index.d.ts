import type { LoggerOptions } from 'winston';

declare module '@gasket/engine' {
  export interface GasketConfig {
    winston?: Partial<Pick<LoggerOptions, 'level' | 'transports' | 'config' | 'silent' | 'levels' | 'format'>>;
  }

  export interface HookExecTypes {
    winstonTransports(): MaybeAsync<LoggerOptions.transports>;
  }
}
