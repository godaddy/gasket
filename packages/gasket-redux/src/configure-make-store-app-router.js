import { configureStore, combineSlices } from '@reduxjs/toolkit';

/**
 * Set up redux store configuration and return a makeStore function
 * @type {import('./index').configureAppRouterStore}
 */
export default function configureAppRouterStore(makeStoreOptions = {}) {
  const {
    customMiddleware = {},
    middleware = [],
    reducers = [],
    enhancers = [(f) => f]
  } = makeStoreOptions;

  const rootReducer = combineSlices(...reducers);

  const makeStore = ()  => {
    return configureStore({
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware(customMiddleware).concat(...middleware);
      },
      // enhancers
    });
  };

  return makeStore;
}
