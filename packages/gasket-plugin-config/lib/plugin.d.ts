import type { MaybeAsync } from '@gasket/engine';
import type { GasketDataIntl } from '@gasket/plugin-intl';
import type { IncomingMessage, OutgoingMessage } from 'http';

declare module '@gasket/engine' {
  export interface GasketConfig {
    configPath?: string
  }

  export interface HookExecTypes {
    appEnvConfig(config: object): MaybeAsync<object>,
    appRequestConfig(
      config: object,
      req: IncomingMessage,
      res: OutgoingMessage
    ): MaybeAsync<object>
  }
}

declare module '@gasket/data' {
  export interface GasketData {
    config: { [key: string | number]: string | undefined };
    intl?: GasketDataIntl;
  }
}
