const { resolve } = require('path');
const { createConfig } = require('./config');

module.exports = {
  dependencies: ['webpack'],
  name: 'nextjs',
  hooks: {
    express: async function express(gasket, expressApp, devServer) {
      const { exec } = gasket;
      const createNextApp = require('next');

      const app = createNextApp({
        dev: devServer,
        conf: await createConfig(gasket, devServer)
      });

      //
      // We need to call the `next` lifecycle before we prepare the application
      // as the prepare step initializes all the routes that a next app can have.
      // If we wait later, it's possible that our added routes/pages are not
      // recognized.
      //
      await exec('next', app);
      await app.prepare();

      expressApp.set(['buildId', app.name].filter(Boolean).join('/'), app.buildId);


      // Note: Not sure if this needs an await, maybe?
      gasket.exec('nextExpress', { express, app });

      const { root, routes } = gasket.config || {};
      const routesModulePath = path.join(root, routes || './routes');
      let ssr;

      try {
        let router = require(routesModulePath);
    
        // Handle ES6-style modules
        if (router.default) {
          router = router.default;
        }
    
        ssr = router.getRequestHandler(app);
      } catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') {
          throw err;
        }
    
        ssr = app.getRequestHandler();
      }
      /** */

      //
      // Now that express has been setup, and users have been able to
      // interact with the express router we want to add a last, catch all
      // route that will activate the `next`.
      //
      expressApp.all('*', ssr);

      return app;
    },
    build: async function build(gasket) {
      //
      // Different versions of Nextjs, have different ways of exporting the builder.
      // In order to support canary, and other versions of next we need to detect
      // the different locations.
      //
      let builder;
      try {
        builder = require('next/dist/server/build').default;
      } catch (e) {
        builder = require('next/dist/build').default;
      }

      return await builder(resolve('.'), await createConfig(gasket, true));
    },
    /**
    * Workbox config partial to add next.js static assets to precache
    *
    * @param {Gasket} gasket The gasket API.
    * @returns {Object} config
    */
    workbox: function (gasket) {
      const { next = {} } = gasket.config;
      const { assetPrefix = '' } = next;

      const parsed = assetPrefix ? url.parse(assetPrefix) : '';
      const joined = parsed ? url.format({ ...parsed, pathname: path.join(parsed.pathname, '_next/') }) : '_next/';

      return {
        globDirectory: '.',
        globPatterns: [
          '.next/static/**'
        ],
        modifyURLPrefix: {
          '.next/': joined
        }
      };
    }
  }
};
