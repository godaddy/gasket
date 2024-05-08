/// <reference types="@gasket/plugin-log" />

import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import Log from '@gasket/log';
import placeholderReducers from './placeholder-reducers';

/**
 * Compose the reducer
 * @type {import('./index').prepareReducer}
 */
export function prepareReducer(allReducers, rootReducer) {
  const combinedReducer = Object.keys(allReducers).length
    ? combineReducers(allReducers)
    : (f = {}) => f;

  if (rootReducer) {
    return (state, action) => {
      const nextState = rootReducer(state, action);
      // if state results are unchanged, continue to combined reducers
      if (nextState === state) {
        return combinedReducer(state, action);
      }
      return nextState;
    };
  }

  return combinedReducer;
}

/**
 * Set up redux store configuration and return a makeStore function
 * @type {import('./index').configureMakeStore}
 */
export default function configureMakeStore(makeStoreOptions = {}, postCreate) {
  const {
    thunkMiddleware = thunk,
    middleware = [],
    logging = false,
    enhancers = [(f) => f],
    reducers = {},
    rootReducer,
    initialState = {}
  } = makeStoreOptions;

  const baseMiddleware = [thunkMiddleware];

  /**
   * Wrapper for store create to create instance with SSR and to hydrate in
   * browser.
   * @type {import('./index').MakeStoreFn}
   */
  function makeStore(state = {}, options = {}) {
    const { req, logger = new Log() } = options;

    // Use existing redux store if it has been already been instantiated by
    // redux-plugin
    if (req && req.store) {
      return req.store;
    }

    const allMiddleware = [...baseMiddleware, ...middleware];

    if (logging) {
      allMiddleware.push(
        createLogger({
          collapsed: true,
          logger
        })
      );
    }

    const composer =
      (typeof window !== 'undefined' &&
        // @ts-ignore - redux devtools extension
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
      compose;
    const enhancer = composer(applyMiddleware(...allMiddleware), ...enhancers);

    const preloadedState = { ...initialState, ...state };

    /** @type {Record<string, import('redux').Reducer>} */
    const allReducers = {
      ...(reducers || {}),
      ...placeholderReducers(reducers, preloadedState)
    };
    const reducer = prepareReducer(allReducers, rootReducer);
    const store = createStore(reducer, { ...initialState, ...state }, enhancer);

    if (postCreate) postCreate(store);

    return store;
  }

  return makeStore;
}
