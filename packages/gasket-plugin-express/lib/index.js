const { promisify } = require('util');
const debug = require('diagnostics')('gasket:express');
const { name, devDependencies } = require('../package');
const glob = promisify(require('glob'));
const path = require('path');

module.exports = {
  name,
  hooks: {
    /**
     * Add files & extend package.json for new apps.
     *
     * @param {Gasket} gasket - The gasket API.
     * @param {CreateContext} context - Create context
     * @param {PackageJson} context.pkg - The Gasket PackageJson API.
     * @public
     */
    create: async function create(gasket, context) {
      const generatorDir = `${__dirname}/../generator`;

      context.pkg.add('dependencies', {
        express: devDependencies.express
      });

      if (context.apiApp) {
        context.files.add(`${generatorDir}/**/*`);

        context.gasketConfig.add('express', {
          routes: './routes/*'
        });
      }
    },
    /**
     * Create the Express instance and setup the lifecycle hooks.
     *
     * @param {Gasket} gasket Gasket API.
     * @param {Object} serverOpts Server options.
     * @returns {Express} The web server.
     * @public
     */
    // eslint-disable-next-line max-statements
    createServers: async function createServers(gasket, serverOpts) {
      const express = require('express');
      const cookieParser = require('cookie-parser');
      const compression = require('compression');

      const { config, logger } = gasket;
      const {
        root,
        express: {
          routes,
          excludedRoutesRegex,
          middlewareInclusionRegex,
          compression: compressionConfig = true
        } = {},
        http2,
        middleware: middlewareConfig
      } = config;

      if (excludedRoutesRegex) {
        // eslint-disable-next-line no-console
        const warn = logger ? logger.warning : console.warn;
        warn(
          'DEPRECATED express config `excludedRoutesRegex` - use `middlewareInclusionRegex`'
        );
      }

      const app = http2 ? require('http2-express-bridge')(express) : express();
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
           * and also, by the the 'compiled' version in Next.js
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

      const middlewarePattern = middlewareInclusionRegex || excludedRoutesRegex;
      if (middlewarePattern) {
        app.use(middlewarePattern, cookieParser());
      } else {
        app.use(cookieParser());
      }

      if (compressionConfig) {
        app.use(compression());
      }

      const middlewares = [];
      await gasket.execApply('middleware', async (plugin, handler) => {
        const middleware = await handler(app);

        if (middleware) {
          if (middlewareConfig) {
            const pluginName = plugin && plugin.name ? plugin.name : '';
            const mwConfig = middlewareConfig.find(
              (mw) => mw.plugin === pluginName
            );
            if (mwConfig) {
              middleware.paths = mwConfig.paths;
              if (middlewarePattern) {
                middleware.paths.push(middlewarePattern);
              }
            }
          }
          middlewares.push(middleware);
        }
      });

      debug('applied %s middleware layers to express', middlewares.length);
      middlewares.forEach((layer) => {
        const { paths } = layer;
        if (paths) {
          app.use(paths, layer);
        } else if (middlewarePattern) {
          app.use(middlewarePattern, layer);
        } else {
          useForAllowedPaths(layer);
        }
      });

      await gasket.exec('express', app);

      if (routes) {
        const files = await glob(`${routes}.js`, { cwd: root });
        for (const file of files) {
          require(path.join(root, file))(app);
        }
      }

      const postRenderingStacks = (await gasket.exec('errorMiddleware')).filter(
        Boolean
      );
      postRenderingStacks.forEach((stack) => app.use(stack));

      return {
        ...serverOpts,
        handler: app
      };
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        guides: [
          {
            name: 'Express Setup Guide',
            description: 'Adding middleware and routes for Express',
            link: 'docs/setup.md'
          }
        ],
        lifecycles: [
          {
            name: 'middleware',
            method: 'exec',
            description: 'Add Express style middleware',
            link: 'README.md#middleware',
            parent: 'createServers'
          },
          {
            name: 'express',
            method: 'exec',
            description: 'Modify the Express instance to for adding endpoints',
            link: 'README.md#express',
            parent: 'createServers',
            after: 'middleware'
          },
          {
            name: 'errorMiddleware',
            method: 'exec',
            description: 'Add Express style middleware for handling errors',
            link: 'README.md#errorMiddleware',
            parent: 'createServers',
            after: 'express'
          }
        ],
        configurations: [
          {
            name: 'express',
            link: 'README.md#configuration',
            description: 'Express plugin configuration',
            type: 'object'
          },
          {
            name: 'express.compression',
            link: 'README.md#configuration',
            description: 'Automatic compression',
            type: 'boolean',
            default: true
          },
          {
            name: 'express.routes',
            link: 'README.md#configuration',
            description: 'Glob pattern for route setup code',
            type: 'string'
          },
          {
            name: 'express.excludedRoutesRegex',
            link: 'README.md#configuration',
            description:
              'Routes to be included for Gasket middleware, based on a regex',
            deprecated: true
          },
          {
            name: 'express.middlewareInclusionRegex',
            link: 'README.md#configuration',
            description:
              'Routes to be included for Gasket middleware, based on a regex'
          }
        ]
      };
    }
  }
};
