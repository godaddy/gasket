import type { LoggerOptions } from 'winston';

declare module '@gasket/core' {
  export interface GasketConfig {
    winston?: Partial<Pick<LoggerOptions, 'level' | 'transports' | 'config' | 'silent' | 'levels' | 'format'>>;
  }

  export interface HookExecTypes {
    winstonTransports(): MaybeAsync<LoggerOptions.transports>;
  }
}

export default {
  name: '@gasket/plugin-winston',
  version: '',
  description: '',
  hooks: {}
};
