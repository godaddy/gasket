const path = require('path');
const url = require('url');
const { name, devDependencies } = require('./package');
const { createConfig } = require('./config');
const { pluginIdentifier } = require('@gasket/resolve');

module.exports = {
  dependencies: ['@gasket/plugin-webpack'],
  name,
  hooks: {
    /**
     * Set up configuration.
     *
     * If the service worker plugin, only the _app entry is configured to be
     * injected with registration script.
     *
     * @param {Gasket} gasket - Gasket
     * @param {Object} baseConfig - Base gasket config
     * @returns {Object} config
     */
    configure: function configure(gasket, baseConfig = {}) {
      const serviceWorker = {
        webpackRegister: key => /_app/.test(key),
        ...(baseConfig.serviceWorker || {})
      };
      return { ...baseConfig, serviceWorker };
    },
    create: {
      timing: {
        after: ['@gasket/plugin-redux']
      },
      /**
       * Add files & extend package.json for new apps.
       *
       * @param {Gasket} gasket - The Gasket API.
       * @param {CreateContext} context - Create context
       * @param {Files} context.files - The Gasket Files API.
       * @param {PackageJson} context.pkg - The Gasket PackageJson API.
       * @param {PluginName} context.testPlugin - The name of included test plugins.
       * @public
       */
      handler: function create(gasket, context) {
        const { files, pkg, testPlugin } = context;

        files.add(
          `${__dirname}/generator/app/.*`,
          `${__dirname}/generator/app/*`,
          `${__dirname}/generator/app/**/*`
        );

        ['jest', 'mocha'].forEach(tester => {
          if (testPlugin && pluginIdentifier(testPlugin).longName === `@gasket/plugin-${tester}`) {
            files.add(
              `${__dirname}/generator/${tester}/*`,
              `${__dirname}/generator/${tester}/**/*`
            );
          }
        });

        pkg.add('dependencies', {
          '@gasket/assets': devDependencies['@gasket/assets'],
          'next': devDependencies.next,
          'prop-types': devDependencies['prop-types'],
          'react': devDependencies.react,
          'react-dom': devDependencies['react-dom']
        });

        if (pkg.has('dependencies', '@gasket/redux')) {
          pkg.add('dependencies', {
            'next-redux-wrapper': devDependencies['next-redux-wrapper']
          });

          files.add(
            `${__dirname}/generator/redux/*`,
            `${__dirname}/generator/redux/**/*`
          );
        }
      }
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
    },
    metadata(gasket, meta) {
      const { routes = 'routes.js' } = gasket.config || {};

      return {
        ...meta,
        guides: [{
          name: 'Next.js Routing Guide',
          description: 'Basic and advance routing for Next.js',
          link: 'docs/routing.md'
        }, {
          name: 'Next.js Deployment Guide',
          description: 'Steps to deploy a Next.js Gasket app',
          link: 'docs/deployment.md'
        }],
        lifecycles: [{
          name: 'nextConfig',
          method: 'execWaterfall',
          description: 'Setup the next config',
          link: 'README.md#nextConfig',
          parent: 'express'
        }, {
          name: 'next',
          method: 'exec',
          description: 'Update the next app instance before prepare',
          link: 'README.md#next',
          parent: 'express',
          after: 'nextConfig'
        }, {
          name: 'nextExpress',
          method: 'exec',
          description: 'Access the prepared next app and express instance',
          link: 'README.md#nextExpress',
          parent: 'express',
          after: 'next'
        }],
        structures: [{
          name: 'pages/',
          description: 'NextJS routing',
          link: 'https://nextjs.org/docs#routing'
        }, {
          name: routes,
          description: 'Routing when using `next-routes`',
          link: 'https://github.com/fridays/next-routes#how-to-use'
        }]
      };
    }
  }
};
