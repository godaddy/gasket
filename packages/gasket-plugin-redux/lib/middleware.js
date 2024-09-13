/* eslint require-atomic-updates: warn */
/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-logger" />

/**
 * Configure middleware
 * @type {import('@gasket/core').HookHandler<'middleware'>}
 */
module.exports = function middlewareHook(gasket) {
  const { redux: reduxConfig = {} } = gasket.config;

  if (!reduxConfig.makeStore) {
    throw new Error(
      'Could not find redux store file. Add a store.js file or configure redux.makeStore in gasket.js.'
    );
  }

  /** @type {import('@gasket/redux').MakeStoreFn} */
  const makeStore = require(reduxConfig.makeStore);

  /**
   * Middleware to attach the redux store to the req object for use in other
   * middleware
   * @type {import('./index').reduxMiddleware}
   */
  return async function middleware(req, res, next) {
    const initState = await gasket.execWaterfall(
      'initReduxState',
      reduxConfig.initState || {},
      {
        req,
        res
      }
    );

    const store = makeStore(initState, {
      logger: reduxConfig.logger || gasket.logger,
      req
    });

    await gasket.exec('initReduxStore', store, { req, res });

    // eslint-disable-next-line require-atomic-updates
    req.store = store;

    if (!res.headersSent) return next();
  };
};
