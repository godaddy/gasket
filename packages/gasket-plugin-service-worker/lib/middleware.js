const { loadRegisterScript } = require('./utils/utils');
const nonNextRoute = /^(?!\/_next\/)/;

/**
 * Middleware lifecycle to return middleware layer
 * @type {import('@gasket/engine').HookHandler<'middleware'>}
 */
module.exports = function middleware(gasket) {
  const { serviceWorker: config } = gasket.config;

  /** @type {import('./index').serviceWorkerMiddleware} */
  return async function layer(req, res, next) {
    if (nonNextRoute.test(req.path)) {
      const content = await loadRegisterScript(config);
      // eslint-disable-next-line require-atomic-updates
      req.swRegisterScript = `<script>${content}</script>`;
    }
    next();
  };
};
