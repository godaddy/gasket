const debug = require('diagnostics')('gasket:express');
const { name, devDependencies } = require('./package');
const glob = require('glob');
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
      context.pkg.add('dependencies', {
        express: devDependencies.express
      });

      if (context.apiApp) {
        context.files.add(`${__dirname}/generator/**/*`);

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

      const { config } = gasket;
      const { root, express: { routes } = {} } = config;
      const excludedRoutesRegex = config.express && config.express.excludedRoutesRegex;
      const app = express();

      if (excludedRoutesRegex) {
        app.use(excludedRoutesRegex, cookieParser());
      } else {
        app.use(cookieParser());
      }

      const { compression: compressionConfig = true } = config.express || {};
      if (compressionConfig) {
        app.use(compression());
      }

      const middlewares = (await gasket.exec('middleware', app)).filter(Boolean);

      debug('applied %s middleware layers to express', middlewares.length);
      middlewares.forEach((layer) => {
        if (excludedRoutesRegex) {
          app.use(excludedRoutesRegex, layer);
        } else {
          app.use(layer);
        }
      });

      await gasket.exec('express', app);

      const postRenderingStacks = (await gasket.exec('errorMiddleware')).filter(Boolean);
      postRenderingStacks.forEach((stack) => app.use(stack));

      if (routes) {
        glob(`${routes}.js`, { cwd: root }, function (err, files) {
          if (err) throw err;

          for (let i = 0; i < files.length; i++) {
            require(path.join(root, files[i]))(app);
          }
        });
      }

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
        ]
      };
    }
  }
};
