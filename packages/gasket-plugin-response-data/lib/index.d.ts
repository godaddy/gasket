import type { MaybeAsync } from '@gasket/core';
import type { IncomingMessage, OutgoingMessage } from 'http';

declare module '@gasket/core' {
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

export default {
  name: '@gasket/plugin-response-data',
  hooks: {}
};
