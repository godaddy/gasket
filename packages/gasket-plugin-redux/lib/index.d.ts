import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Store } from 'redux';
import type { MaybeAsync } from '@gasket/engine';
import type { Log } from '@gasket/plugin-log';

/**
 * Class to add statements to redux store.
 */
declare class ReduxReducers {
  _imports: string[];
  _entries: string[];

  constructor();

  /**
   * Add an import statement for reducers This should string formatted as a
   * CommonJS require
   * @example
   * reduxReducers.addImport("const exampleReducers = require('@example/reducers');");
   */
  addImport(str: string): void;

  /**
   * Add reducers This should be in CommonJS format
   * @example
   * // as an object of reducers
   * reduxReducers.addEntry('...exampleReducers');
   * // const reducers = {
   * //  ...exampleReducers
   * // }
   * @example
   * // as a single reducer
   * reduxReducers.addEntry('example: exampleReducer');
   * // const reducers = {
   * //  example: exampleReducer
   * // }
   */
  addEntry(str: string): void;
}

declare module 'http' {
  export interface IncomingMessage {
    store?: Store;
  }
}

declare module '@gasket/cli' {
  export interface CreateContext {
    hasGasketRedux?: boolean;
    reduxReducers?: ReduxReducers;
  }
}

declare module '@gasket/engine' {
  export interface GasketConfig {
    redux?: {
      makeStore?: string;
      initState?: any;
      logger?: Log;
    };
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
    ): MaybeAsync<void>;
  }
}

export async function reduxMiddleware(
  req: IncomingMessage,
  res: OutgoingMessage,
  next: (err?: any) => void
): Promise<void>;
