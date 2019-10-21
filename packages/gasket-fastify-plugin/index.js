const debug = require('diagnostics')('gasket:express');

module.exports = {
  name: 'express',
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
        express: '^4.16.3'
      });
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

      const middlewares = await gasket.exec('middleware', app);

      debug('applied %s middleware layers to express', middlewares.length);
      middlewares.forEach(layer => {
        if (excludedRoutesRegex) {
          app.use(excludedRoutesRegex, layer);
        } else {
          app.use(layer);
        }
      });

      await gasket.exec('express', app);

      const postRenderingStacks = await gasket.exec('errorMiddleware');
      postRenderingStacks.forEach(stack => app.use(stack));

      return {
        ...serverOpts,
        handler: app
      };
    }
  }
};
