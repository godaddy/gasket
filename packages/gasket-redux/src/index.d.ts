import type { Store } from 'redux';

/**
 * Wrapper for store create to create instance with SSR and to hydrate in browser.
 *
 * @typedef {function} makeStoreFn
 *
 * @param {Object.<string,*>} state - The initial redux state
 * @param {Object} options - Options
 * @param {Request} options.req - Request if SSR
 * @returns {Object} reduxStore
 */

export type MakeStoreFn = {
  (state: any, options: { req?: Request }): Store;
};

/**
 * Set up redux store configuration and return a makeStore function
 *
 * @param {Object} options - Options for create store
 * @param {Object.<string,function>} options.reducers - Map of identifiers and reducers
 * @param {function} [options.rootReducer] - Entry reducer to run before combined reducers
 * @param {Object.<string,*>} [options.initialState] - Initial redux state
 * @param {function[]} [options.middleware] - Middleware
 * @param {function[]} [options.enhancers] - Any additional enhancers
 * @param {boolean} [options.logging] - logging is enabled by default. Passing false will disable logging completely.
 * @param {function} [options.thunkMiddleware] - Optionally provide an extra argument for thunks
 * @param {function} [postCreate] - Optional callback
 * @returns {MakeStoreFn} makeStore
 */
export function configureMakeStore({
  reducers,
  rootReducer,
  initialState,
  middleware,
  enhancers,
  logging,
  thunkMiddleware
}?: {
  reducers: {
    [x: string]: (state: any, action: object) => any;
  };
  rootReducer?: (state: any, action: object) => any;
  initialState?: {
    [x: string]: any;
  };
  middleware?: Function[];
  enhancers?: Function[];
  logging?: boolean;
  thunkMiddleware?: Function;
}, postCreate?: Function): MakeStoreFn;

/**
 * Helper to check for an existing store on context, otherwise make a new instance.
 *
 * @param {function} fallbackMakeStore - A makeStore function to create new stores
 * @returns {function(object): object} getOrCreateStore
 */
export function getOrCreateStore(fallbackMakeStore: Function): (arg0: object) => object;
