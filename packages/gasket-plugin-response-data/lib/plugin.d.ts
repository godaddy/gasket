import type { MaybeAsync } from '@gasket/engine';
import type { IncomingMessage, OutgoingMessage } from 'http';

declare module '@gasket/engine' {
  export interface GasketConfig {
    gasketDataDir?: string
  }

  export interface HookExecTypes {
    gasketData(config: object): MaybeAsync<object>,
    responseData(
      config: object,
      context: { req: IncomingMessage, res: OutgoingMessage }
    ): MaybeAsync<object>
  }
}
