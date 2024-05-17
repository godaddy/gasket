import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Store } from 'redux';
import type { MaybeAsync } from '@gasket/core';
import { Logger } from '@gasket/plugin-logger';

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

declare module 'create-gasket-app' {
  export interface CreateContext {
    hasGasketRedux?: boolean;
    reduxReducers?: ReduxReducers;
  }
}

declare module '@gasket/core' {
  export interface GasketConfig {
    redux?: {
      makeStore?: string;
      initState?: any;
      logger?: Console | Logger;
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
