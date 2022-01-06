import type { LoggerOptions } from 'winston'
import type Transport from 'winston-transport';

declare module '@gasket/engine' {
  export interface GasketConfig {
    log?: {
      prefix?: string
    };

    winston?: LoggerOptions
  }

  export interface HookExecTypes {
    logTransports(): MaybeAsync<MaybeMultiple<Transport>>
  }
}
