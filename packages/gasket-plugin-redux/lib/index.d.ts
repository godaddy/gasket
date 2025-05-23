import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Store } from 'redux';
import type { MaybeAsync, Plugin } from '@gasket/core';
import type { Logger } from '@gasket/plugin-logger';
import type { Console } from 'inspector/promises';
import type { RequestLike } from '@gasket/request';

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

export interface ReduxConfig {
  makeStore?: string;
  makeStorePath?: string;
  initState?: any;
  logger?: Console | Logger;
}

declare module 'create-gasket-app' {
  export interface CreateContext {
    hasGasketRedux?: boolean;
    reduxReducers?: ReduxReducers;
    useRedux?: boolean;
  }
}

declare module '@gasket/core' {
  export interface GasketConfig {
    redux?: ReduxConfig
  }

  export interface HookExecTypes {
    initReduxState<State>(
      state: State,
      context: { req: RequestLike | IncomingMessage, res: OutgoingMessage }
    ): MaybeAsync<State>;

    initReduxStore(
      store: Store,
      context: { req: IncomingMessage, res: OutgoingMessage }
    ): MaybeAsync<void>
  }
}

export function reduxMiddleware(
  req: IncomingMessage,
  res: OutgoingMessage,
  next: (err?: any) => void
): Promise<void>;

declare const plugin: Plugin;

export default plugin;
