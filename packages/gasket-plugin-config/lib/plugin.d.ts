import type { MaybeAsync } from '@gasket/engine';
import type { IncomingMessage, OutgoingMessage } from 'http';

declare module '@gasket/engine' {
  export interface GasketConfig {
    /** Custom path to config folder */
    configPath?: string
  }

  export interface HookExecTypes {
    /**  */
    appEnvConfig(config: object): MaybeAsync<object>,
    /** Enables plugins to inject configuration derived from the request being processed */
    appRequestConfig(
      config: object,
      req: IncomingMessage,
      res: OutgoingMessage
    ): MaybeAsync<object>
  }
}

declare module '@gasket/data' {
  export interface GasketData {
    config?: object
  }
}

declare module 'http' {
  interface IncomingMessage {
    config: {
      [key: string]: any,
      public?: {
        [key: string]: any
      }
    };
  }
}
