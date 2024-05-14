import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Store } from 'redux';
import type { MaybeAsync } from '@gasket/core';

declare module '@gasket/core' {
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

export async function reduxMiddleware(
  req: IncomingMessage,
  res: OutgoingMessage,
  next: (err?: any) => void
): Promise<void>;
