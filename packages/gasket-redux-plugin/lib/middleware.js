/* eslint require-atomic-updates: warn */

const { getReduxConfig } = require('./utils');

/**
 * Configure middleware
 *
 * @param {Object} gasket - The Gasket API
 * @returns {Function} middleware
 */
module.exports = function configureMiddleware(gasket) {
  const reduxConfig = getReduxConfig(gasket) || {};

  const makeStore = require(
    reduxConfig.makeStore
    || '@gasket/redux/make-store');

  /**
   * Middleware to attach the redux store to the req object for use in other middleware
   *
   * @param {Request} req - Request
   * @param {Response} res - Response
   * @param {Function} next - Callback
   */
  async function middleware(req, res, next) {
    const initState = await gasket.execWaterfall(
      'initReduxState',
      reduxConfig.initState || {},
      req,
      res);

    const store = makeStore(initState, {
      logger: reduxConfig.logger,
      req
    });

    await gasket.exec('initReduxStore', store, req, res);

    req.store = store;

    if (!res.headersSent) return next();
  }

  return middleware;
};
