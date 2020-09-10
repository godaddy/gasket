import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import Log from '@gasket/log';
import placeholderReducers from './placeholder-reducers';

/**
 * Compose the reducer
 *
 * @param {object} allReducers - Map of identifiers and reducers
 * @param {function} [rootReducer] - Entry reducer to run before combined reducers
 * @returns {function} reducer
 * @private
 */
export function prepareReducer(allReducers, rootReducer) {
  const combinedReducer = Object.keys(allReducers).length ? combineReducers(allReducers) : (f = {}) => f;

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
 *
 * @param {Object} options - Options for create store
 * @param {Object.<String,Function>} options.reducers - Map of identifiers and reducers
 * @param {function} [options.rootReducer] - Entry reducer to run before combined reducers
 * @param {Object} [options.initialState] - Initial redux state
 * @param {Array} [options.middleware] - Middleware
 * @param {Function[]} [options.enhancers] - Any additional enhancers
 * @param {Boolean} [options.logging] - logging is enabled by default. Passing false will disable logging completely.
 * @param {Function} [options.thunkMiddleware] - Optionally provide an extra argument for thunks
 * @param {Function} [postCreate] - Optional callback
 * @returns {MakeStore} makeStore
 */
export default function configureMakeStore(
  {
    reducers = {},
    rootReducer,
    initialState = {},
    middleware = [],
    enhancers = [f => f],
    logging = false, thunkMiddleware = thunk
  } = {},
  postCreate
) {
  const baseMiddleware = [thunkMiddleware];

  /**
   * Wrapper for store create to create instance with SSR and to hydrate in browser.
   *
   * @typedef {Function} MakeStore
   *
   * @param {Object} state - The initial redux state
   * @param {Object} options - Options
   * @param {Request} options.req - Request if SSR
   * @returns {Store} reduxStore
   */
  function makeStore(state = {}, options = {}) {
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
      ...enhancers
    );

    const preloadedState = { ...initialState, ...state };
    const allReducers = { ...reducers, ...placeholderReducers(reducers, preloadedState) };
    const reducer = prepareReducer(allReducers, rootReducer);
    const store = createStore(reducer, { ...initialState, ...state }, enhancer);

    if (postCreate) postCreate(store);

    return store;
  }

  return makeStore;
}
