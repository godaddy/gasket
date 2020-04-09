const { loadRegisterScript } = require('./utils');
const nonNextRoute = /^(?!\/_next\/)/;

/**
 * Middleware lifecycle to return middleware layer
 *
 * @param {Gasket} gasket - Gasket
 * @returns {Function} middleware
 */
module.exports = function middleware(gasket) {
  const { serviceWorker: config } = gasket.config;

  /**
   * Middleware layer to attach the service worker registration script to req
   *
   * @param {Request} req - Request
   * @param {Response} res - Response
   * @param {Function} next - Callback
   * @returns {Promise} promise
   */
  async function layer(req, res, next) {
    if (nonNextRoute.test(req.path)) {
      const content = await loadRegisterScript(config);
      // eslint-disable-next-line require-atomic-updates
      req.swRegisterScript = `<script>${content}</script>`;
    }
    next();
  }

  return layer;
};
