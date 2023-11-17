import { promisify } from 'util';
import { default as diagnostics } from 'diagnostics';
const debug = diagnostics('gasket:express');
import { default as pkg } from '../package.json' assert { type: 'json' };
const { name, devDependencies } = pkg;
import * as syncGlob from 'glob';
const glob = promisify(syncGlob.default);
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

export default {
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
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const generatorDir = `${ __dirname }/../generator`;

      context.pkg.add('dependencies', {
        express: devDependencies.express
      });

      if (context.apiApp) {
        context.files.add(`${ generatorDir }/**/*`);

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
      const express = await import('express');
      const cookieParser = await import('cookie-parser');
      const compression = await import('compression');

      const { config } = gasket;
      const { root, express: { routes } = {}, http2, middleware: middlewareConfig } = config;
      const excludedRoutesRegex = config.express && config.express.excludedRoutesRegex;
      const app = http2 ? (await import('http2-express-bridge'))(express) : express();

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
          });
      }

      if (excludedRoutesRegex) {
        app.use(excludedRoutesRegex, cookieParser());
      } else {
        app.use(cookieParser());
      }

      const { compression: compressionConfig = true } = config.express || {};
      if (compressionConfig) {
        app.use(compression());
      }

      const middlewares = [];
      await gasket.execApply('middleware', async (plugin, handler) => {
        const middleware = await handler(app);

        if (middleware) {
          if (middlewareConfig) {
            const pluginName = plugin && plugin.name ? plugin.name : '';
            const mwConfig = middlewareConfig.find(mw => mw.plugin === pluginName);
            if (mwConfig) {
              middleware.paths = mwConfig.paths;
              if (excludedRoutesRegex) {
                middleware.paths.push(excludedRoutesRegex);
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
        } else if (excludedRoutesRegex) {
          app.use(excludedRoutesRegex, layer);
        } else {
          app.use(layer);
        }
      });

      await gasket.exec('express', app);

      if (routes) {
        const files = await glob(`${ routes }.js`, { cwd: root });
        for (const file of files) {
          await import(join(root, file))(app);
        }
      }

      const postRenderingStacks = (await gasket.exec('errorMiddleware')).filter(Boolean);
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
        configurations: [{
          name: 'express',
          link: 'README.md#configuration',
          description: 'Express plugin configuration',
          type: 'object'
        }, {
          name: 'express.compression',
          link: 'README.md#configuration',
          description: 'Automatic compression',
          type: 'boolean',
          default: true
        }, {
          name: 'express.excludedRoutesRegex',
          link: 'README.md#configuration',
          description: 'Routes to be excluded based on a regex'
        }]
      };
    }
  }
};
