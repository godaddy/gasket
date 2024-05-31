import { name } from '../package.json';
import { applyCompression, applyCookieParser, executeMiddlewareLifecycle } from './utils';
import cookieParser from 'cookie-parser';
import middie from 'middie';

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  hooks: {
    async express(gasket, app) {
      const { config } = gasket;
      const {
        express: {
          middlewareInclusionRegex,
          excludedRoutesRegex,
          compression: compressionConfig = true
        },
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
            // @ts-ignore
            if (!res._implicitHeader) {
            // @ts-ignore
              res._implicitHeader = () => res.writeHead(res.statusCode);
            }
            return next();
          }
        );
      }

      // eslint-disable-next-line jsdoc/require-jsdoc
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

    },
    async fastify(gasket, app) {
      const { config } = gasket;
      const {
        fastify: {
          middlewareInclusionRegex,
          excludedRoutesRegex,
          compression: compressionConfig = true
        }
      } = config;

      // Enable middleware for fastify@3
      await app.register(middie);

      // Add express-like `res.locals` object attaching data
      app.use((req, res, next) => {
        res.locals = {};
        next();
      });

      const middlewarePattern = middlewareInclusionRegex || excludedRoutesRegex;

      applyCookieParser(app, middlewarePattern);
      applyCompression(app, compressionConfig);

      executeMiddlewareLifecycle(gasket, app, middlewarePattern);
    }
  }
};


export default plugin;
