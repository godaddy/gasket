import type { Store, Reducer, Middleware } from 'redux';
import type { IncomingMessage, OutgoingMessage } from 'http';
import type { ThunkMiddleware } from 'redux-thunk';

declare module 'http' {
  interface IncomingMessage {
    store?: Store;
  }
}

export type MakeStoreFnOptions = {
  logger?: Log;
  req?: IncomingMessage;
}

/**
 * Wrapper for store create to create instance with SSR and to hydrate in
 * browser.
 */
export type MakeStoreFn = {
  (
    /** The initial redux state */
    state: any,
    options: MakeStoreFnOptions
  ): Store;
};

export interface ConfigureMakeStoreOptions {
  /** Map of identifiers and reducers */
  reducers?: Object<string, Reducer>;
  /** Entry reducer to run before combined reducers */
  rootReducer?: Reducer;
  initialState?: {
    [x: string]: any;
  };
  middleware?: Middleware[];
  enhancers?: Function[];
  /**
   * Logging is enabled by default. Passing false will disable logging
   * completely.
   */
  logging?: boolean;
  thunkMiddleware?: ThunkMiddleware;
}

/** Compose the reducer */
export function prepareReducer(
  /** Map of identifiers and reducers */
  allReducers: Record<string, Reducer>,
  /** Entry reducer to run before combined reducers */
  rootReducer?: Reducer
): Reducer;

/**
 * Set up redux store configuration and return a makeStore function
 */
export function configureMakeStore(
  options?: ConfigureMakeStoreOptions | ((options: MakeStoreFnOptions) => ConfigureMakeStoreOptions),
  postCreate?: Function
): MakeStoreFn;

/**
 * Helper to check for an existing store on context, otherwise make a new
 * instance.
 */
export function getOrCreateStore(
  /** A makeStore function to create new stores */
  fallbackMakeStore: Function
): (arg0: object) => object;

/**
 * Sometimes we want to use redux to set app state with utilizing actions or
 * reducers, for consistency between browser and server rendering. As such, if
 * keys in preloadedState do not have corresponding reducers, this will add
 * placeholders.
 */
export function placeholderReducers(
  reducers?: Object<string, Reducer>,
  /** State to preload store with */
  preloadedState?: Object<string, any>
): Object<string, Reducer>;
