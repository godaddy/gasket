import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Store } from 'redux';
import type { MaybeAsync } from '@gasket/engine';

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
      context: { req: IncomingMessage, res: OutgoingMessage }
    ): MaybeAsync<State>;
    initReduxStore(
      store: Store,
      context: { req: IncomingMessage, res: OutgoingMessage }
    ): MaybeAsync<void>
  }
}
