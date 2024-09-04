/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-https" />
/// <reference types="@gasket/plugin-logger" />

const cookieParser = require('cookie-parser');
const { applyCompression, applyCookieParser, executeMiddlewareLifecycle } = require('./utils');

/**
 * Express lifecycle to add an endpoint to serve service worker script
 * @type {import('@gasket/core').HookHandler<'express'>}
 */
module.exports = async function express(gasket, app) {
  const { config } = gasket;
  const {
    express: {
      middlewareInclusionRegex,
      excludedRoutesRegex,
      compression: compressionConfig = true,
      trustProxy = false
    } = {},
    http2
  } = config;

  const middlewarePattern = middlewareInclusionRegex || excludedRoutesRegex;

  const useForAllowedPaths = (...middleware) =>
    middleware.forEach((mw) => {
      if (excludedRoutesRegex) {
        app.use(excludedRoutesRegex, mw);
      } else {
        app.use(mw);
      }
    });

  if (http2) {
    app.use(
      /*
       * This is a patch for the undocumented _implicitHeader used by the
       * compression middleware which is not present the http2 request object
       * @see: https://github.com/expressjs/compression/pull/128
       * and also, by the 'compiled' version in Next.js
       * @see: https://github.com/vercel/next.js/issues/11669
       */
      function http2Patch(req, res, next) {
        if (!res._implicitHeader) {
          res._implicitHeader = () => res.writeHead(res.statusCode);
        }
        return next();
      }
    );
  }

  if (trustProxy) {
    app.set('trust proxy', trustProxy);
  }

  /**
   * Attaches a metadata function to the logger that allows for chaining
   * @type {import('./internal').attachLogEnhancer}
   */
  function attachLogEnhancer(req) {
    req.logger.metadata = (metadata) => {
      req.logger = req.logger.child(metadata);
      attachLogEnhancer(req);
    };
  }

  useForAllowedPaths((req, res, next) => {
    req.logger = gasket.logger;
    attachLogEnhancer(req);
    next();
  });
  useForAllowedPaths(cookieParser());

  applyCookieParser(app, middlewarePattern);
  applyCompression(app, compressionConfig);

  executeMiddlewareLifecycle(gasket, app, middlewarePattern);
};
