import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Store } from 'redux';

declare module '@gasket/engine' {
  export interface GasketConfig {
    redux?: {
      makeStore?: string,
      initState?: any
    }
  }

  export interface HookExecTypes {
    initReduxState<State>(
      state: State,
      req: IncomingMessage,
      res: OutgoingMessage
    ): MaybeAsync<State>;
    initReduxStore(
      store: Store,
      req: IncomingMessage,
      res: OutgoingMessage
    ): MaybeAsync<void>
  }
}
