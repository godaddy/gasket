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

    // eslint-disable-next-line require-atomic-updates
    req.store = store;

    next();
  }

  return middleware;
};
