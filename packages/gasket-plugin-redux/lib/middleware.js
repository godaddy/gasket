/* eslint require-atomic-updates: warn */

/**
 * Configure middleware
 *
 * @param {Object} gasket - The Gasket API
 * @returns {Function} middleware
 */
module.exports = function middlewareHook(gasket) {
  const { redux: reduxConfig = {} } = gasket.config;

  if (!reduxConfig.makeStore) {
    throw new Error(
      'Could not find redux store file. Add a store.js file or configure redux.makeStore in gasket.config.js.'
    );
  }
  const makeStore = require(reduxConfig.makeStore);

  /**
   * Middleware to attach the redux store to the req object for use in other
   * middleware
   *
   * @param {Request} req - Request
   * @param {Response} res - Response
   * @param {Function} next - Callback
   */
  async function middleware(req, res, next) {
    const initState = await gasket.execWaterfall(
      'initReduxState',
      reduxConfig.initState || {},
      {
        req,
        res
      }
    );

    const store = makeStore(initState, {
      logger: reduxConfig.logger || req.logger,
      req
    });

    await gasket.exec('initReduxStore', store, { req, res });

    req.store = store;

    if (!res.headersSent) return next();
  }

  return middleware;
};
