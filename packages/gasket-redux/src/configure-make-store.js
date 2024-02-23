import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import placeholderReducers from './placeholder-reducers';

/**
 * Compose the reducer
 *
 * @param {Object.<string,function>} allReducers - Map of identifiers and reducers
 * @param {function} [rootReducer] - Entry reducer to run before combined reducers
 * @returns {function} reducer
 * @private
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
 * @returns {makeStoreFn} makeStore
 */
export default function configureMakeStore(
  {
    reducers = {},
    rootReducer,
    initialState = {},
    middleware = [],
    enhancers = [(f) => f],
    logging = false,
    thunkMiddleware = thunk
  } = {},
  postCreate
) {
  const baseMiddleware = [thunkMiddleware];

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
  function makeStore(state = {}, options = {}) {
    const { req, logger = console } = options;

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

    const composer =
      (typeof window !== 'undefined' &&
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
      compose;
    const enhancer = composer(applyMiddleware(...allMiddleware), ...enhancers);

    const preloadedState = { ...initialState, ...state };
    const allReducers = {
      ...reducers,
      ...placeholderReducers(reducers, preloadedState)
    };
    const reducer = prepareReducer(allReducers, rootReducer);
    const store = createStore(reducer, { ...initialState, ...state }, enhancer);

    if (postCreate) postCreate(store);

    return store;
  }

  return makeStore;
}
