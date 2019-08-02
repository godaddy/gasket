/* eslint-disable no-process-env */

import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import dynostore, { dynamicReducers, filteredReducer, shallowStateHandler } from '@redux-dynostore/core';
import { createLogger } from 'redux-logger';
import Log from '@gasket/log';

const baseMiddleware = [thunk];

/**
 * Set up redux store configuration and return a makeStore function
 *
 * @param {Object} options - Options for create store
 * @param {Object} options.initialState - Initial redux state
 * @param {Object.<String,Function>} options.reducers - Map of identifiers and reducers
 * @param {Array} options.middleware - Middleware
 * @param {Function[]} options.enhancers - Any additional enhancers
 * @param {Boolean} options.logging - logging is enabled by default. Passing false will disable logging completely.
 * @param {Function} [postCreate] - Optional callback
 * @returns {function(*=): Store<{}>} makeStore
 */
export default function configureMakeStore(
  { initialState = {}, reducers, middleware = [], enhancers = [f => f], logging = false } = {},
  postCreate
) {
  /**
   * Wrapper for store create to create instance with SSR and to hydrate in browser.
   *
   * Conforms to API required by next-redux-wrapper
   * https://github.com/kirill-konshin/next-redux-wrapper
   *
   * @param {Object} state - The initial redux state
   * @param {Object} options - Options
   * @param {Request} options.req - Request if SSR
   * @returns {Store} reduxStore
   */
  return function makeStore(state = {}, options = {}) {
    const { req, logger = new Log() } = options;

    //
    // Use existing redux store if it has been already been instantiated by redux-plugin
    //
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

    const composer = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
    const enhancer = composer(
      applyMiddleware(...allMiddleware),
      dynostore(dynamicReducers(), { stateHandler: shallowStateHandler }),
      ...enhancers
    );

    // filteredReducer preserves keys in redux state that do not have matching reducers
    const reducer = reducers ? filteredReducer(combineReducers({ ...reducers })) : f => f || {};

    const store = createStore(reducer, { ...initialState, ...state }, enhancer);

    if (postCreate) postCreate(store);

    return store;
  };
}
