const path = require('path');
const url = require('url');
const { createConfig } = require('./config');

module.exports = {
  dependencies: ['webpack'],
  name: 'nextjs',
  hooks: {
    /**
    * Add files & extend package.json for new apps.
    *
    * @param {Gasket} gasket - The gasket API.
    * @param {CreateContext} context - Create context
    * @param {Files} context.files - The Gasket Files API.
    * @param {PackageJson} context.pkg - The Gasket PackageJson API.
    * @public
    */
    create: function create(gasket, context) {
      const { files, pkg } = context;

      files.add(
        `${__dirname}/generator/.*`,
        `${__dirname}/generator/*`,
        `${__dirname}/generator/**/*`
      );

      pkg.add('dependencies', {
        '@gasket/assets': '^1.0.0',
        'next': '^9.0.4',
        'prop-types': '^15.6.2',
        'react': '^16.8.4',
        'react-dom': '^16.8.4'
      });
    },
    express: async function express(gasket, expressApp) {
      const { exec, command } = gasket;
      const createNextApp = require('next');
      const devServer = (command.id || command) === 'local';

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

      await exec('nextExpress', { next: app, express: expressApp });

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

      //
      // Now that express has been setup, and users have been able to
      // interact with the express router we want to add a last, catch all
      // route that will activate the `next`.
      //
      expressApp.all('*', ssr);

      return app;
    },
    build: async function build(gasket) {
      const { command } = gasket;
      // Don't do a build, use dev server for local
      if ((command.id || command) === 'local') return;

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

      return await builder(path.resolve('.'), await createConfig(gasket, true));
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
