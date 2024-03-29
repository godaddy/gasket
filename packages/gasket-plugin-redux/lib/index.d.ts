import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Store } from 'redux';
import type { MaybeAsync } from '@gasket/engine';

declare module '@gasket/engine' {
  export interface GasketConfig {
    redux?: {
      makeStore?: string;
      initState?: any;
    };
  }

  export interface State extends Record<string, any> {
    config?: {
      [key: string]: any;
    };
  }

  export interface HookExecTypes {
    initReduxState<T extends State>(
      state: T,
      req: IncomingMessage,
      res: OutgoingMessage
    ): MaybeAsync<State>;
    initReduxStore(
      store: Store,
      req: IncomingMessage,
      res: OutgoingMessage
    ): MaybeAsync<void>;
  }
}

declare module '@gasket/cli' {
  export interface CreateContext {
    hasGasketRedux?: boolean;
  }
}
