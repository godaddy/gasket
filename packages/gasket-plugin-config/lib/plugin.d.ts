import type { MaybeAsync } from '@gasket/engine';
import type { IncomingMessage, OutgoingMessage } from 'http';

declare module '@gasket/engine' {
  export interface GasketConfig {
    configPath?: string
  }

  export interface HookExecTypes {
    appEnvConfig(config: any): MaybeAsync<any>,
    appRequestConfig(
      config: any,
      req: IncomingMessage,
      res: OutgoingMessage
    ): MaybeAsync<any>
  }
}
