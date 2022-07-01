import type { LoggerOptions } from 'winston'
import type * as Transport from 'winston-transport';
import type { MaybeAsync, MaybeMultiple } from '@gasket/engine';
import type Log from '@gasket/log';

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

  export interface Gasket {
    logger: Log
  }
}
