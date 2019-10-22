const debug = require('diagnostics')('gasket:fastify');
const { peerDependencies } = require('./package.json');

module.exports = {
  name: 'fastify',
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
        fastify: peerDependencies.fastify
      });
    },
    /**
    * Create the Fastify instance and setup the lifecycle hooks.
    * Fastify is compatible with express middleware out of the box, so we can
    * use the same middleware lifecycles.
    *
    * @param {Gasket} gasket Gasket API.
    * @param {Object} serverOpts Server options.
    * @returns {Express} The web server.
    * @public
    */
    // eslint-disable-next-line max-statements
    createServers: async function createServers(gasket, serverOpts) {
      const fastify = require('fastify');
      const cookieParser = require('cookie-parser');
      const compression = require('compression');

      const { config } = gasket;
      const excludedRoutesRegex = config.fastify && config.fastify.excludedRoutesRegex;
      const app = fastify();

      if (excludedRoutesRegex) {
        app.use(excludedRoutesRegex, cookieParser());
      } else {
        app.use(cookieParser());
      }

      const { compression: compressionConfig = true } = config.fastify || {};
      if (compressionConfig) {
        app.use(compression());
      }

      const middlewares = await gasket.exec('middleware', app);

      debug('applied %s middleware layers to fastify', middlewares.length);
      middlewares.forEach(layer => {
        if (excludedRoutesRegex) {
          app.use(excludedRoutesRegex, layer);
        } else {
          app.use(layer);
        }
      });

      // allow consuming apps to directly append options to their server
      await gasket.exec('fastify', app);

      const postRenderingStacks = await gasket.exec('errorMiddleware');
      postRenderingStacks.forEach(stack => app.use(stack));

      return {
        ...serverOpts,
        handler: app
      };
    }
  }
};
