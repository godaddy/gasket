const path = require('path');
const url = require('url');
const { name, devDependencies } = require('../package');
const { createConfig } = require('./config');
const { pluginIdentifier } = require('@gasket/resolve');

const isDefined = (o) => typeof o !== 'undefined';

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
    configure: {
      timing: {
        first: true // Fixup next -> nextConfig early for reference by other plugins
      },
      handler: function configure(gasket, baseConfig = {}) {
        const { logger } = gasket;
        const { next, ...rest } = baseConfig;
        if (next) {
          logger.warning('DEPRECATED `next` in Gasket config - use `nextConfig`');
        }
        const { nextConfig = next || {} } = baseConfig;

        const serviceWorker = {
          webpackRegister: (key) => /_app/.test(key),
          ...(baseConfig.serviceWorker || {})
        };
        return { ...rest, serviceWorker, nextConfig };
      }
    },
    create: {
      timing: {
        before: ['@gasket/plugin-intl'],
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
        const generatorDir = `${__dirname}/../generator`;

        files.add(
          `${generatorDir}/app/.*`,
          `${generatorDir}/app/*`,
          `${generatorDir}/app/**/*`
        );

        ['jest', 'mocha', 'cypress'].forEach((tester) => {
          if (
            testPlugin &&
            pluginIdentifier(testPlugin).longName === `@gasket/plugin-${tester}`
          ) {
            files.add(`${generatorDir}/${tester}/*`, `${generatorDir}/${tester}/**/*`);
          }
        });

        pkg.add('dependencies', {
          '@gasket/assets': devDependencies['@gasket/assets'],
          '@gasket/nextjs': devDependencies['@gasket/nextjs'],
          'next': devDependencies.next,
          'prop-types': devDependencies['prop-types'],
          'react': devDependencies.react,
          'react-dom': devDependencies['react-dom']
        });

        if (pkg.has('dependencies', '@gasket/redux')) {
          pkg.add('dependencies', {
            'next-redux-wrapper': devDependencies['next-redux-wrapper'],
            'lodash.merge': devDependencies['lodash.merge']
          });

          files.add(`${generatorDir}/redux/*`, `${generatorDir}/redux/**/*`);
        }
      }
    },
    express: {
      timing: {
        last: true
      },
      handler: async function express(gasket, expressApp) {
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

        // If the Gasket Intl Plugin is used to determine the locale, then we need
        // to let NextJS know that it has already been detected. We can do this by
        // forcing the `NEXT_LOCALE` cookie:
        // https://github.com/vercel/next.js/blob/canary/docs/advanced-features/i18n-routing.md#leveraging-the-next_locale-cookie
        expressApp.use(function setNextLocale(req, res, next) {
          if (res.locals && res.locals.gasketData && res.locals.gasketData.intl) {
            const { locale } = res.locals.gasketData.intl;
            if (locale) {
              req.headers.cookie = (req.headers.cookie || '') + `;NEXT_LOCALE=${locale}`;
            }
          }
          next();
        });

        //
        // Now that express has been setup, and users have been able to
        // interact with the express router we want to add a last, catch all
        // route that will activate the `next`.
        //
        expressApp.all('*', app.getRequestHandler());

        return app;
      }
    },
    fastify: {
      timing: {
        last: true
      },
      handler: async function fastify(gasket, fastifyApp) {
        const { exec, command } = gasket;
        const createNextApp = require('next');
        const devServer = (command.id || command) === 'local';

        const app = createNextApp({
          dev: devServer,
          conf: await createConfig(gasket, devServer)
        });

        await exec('next', app);
        await app.prepare();

        fastifyApp.decorate(['buildId', app.name].filter(Boolean).join('/'), {
          getter() {
            return app.build;
          }
        });

        await exec('nextFastify', { next: app, fastify: fastifyApp });

        fastifyApp.register(function setNextLocale(req, res, next) {
          if (res.locals && res.locals.gasketData && res.locals.gasketData.intl) {
            const { locale } = res.locals.gasketData.intl;
            if (locale) {
              req.headers.cookie = (req.headers.cookie || '') + `;NEXT_LOCALE=${locale}`;
            }
          }
          next();
        });

        fastifyApp.all('/*', app.getRequestHandler());
        return app;
      }
    },
    build: async function build(gasket) {
      const { command } = gasket;
      // Don't do a build, use dev server for local
      if ((command.id || command) === 'local') return;

      const builder = require('next/dist/build').default;
      return await builder(path.resolve('.'), await createConfig(gasket, true));
    },
    /**
     * Workbox config partial to add next.js static assets to precache
     *
     * @param {Gasket} gasket The gasket API.
     * @returns {Object} config
     */
    workbox: function (gasket) {
      const { nextConfig = {}, basePath: rootBasePath } = gasket.config;
      const assetPrefix = [
        nextConfig.assetPrefix,
        nextConfig.basePath,
        rootBasePath,
        ''
      ].find(isDefined);

      const parsed = assetPrefix ? url.parse(assetPrefix) : '';
      const joined = parsed
        ? url.format({ ...parsed, pathname: path.join(parsed.pathname, '_next/') })
        : '_next/';

      return {
        globDirectory: '.',
        globPatterns: ['.next/static/**'],
        modifyURLPrefix: {
          '.next/': joined
        }
      };
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        guides: [
          {
            name: 'Next.js Routing Guide',
            description: 'Basic and advance routing for Next.js',
            link: 'docs/routing.md'
          },
          {
            name: 'Next.js Deployment Guide',
            description: 'Steps to deploy a Next.js Gasket app',
            link: 'docs/deployment.md'
          },
          {
            name: 'Next.js Redux Guide',
            description: 'Using Redux with Next.js Gasket apps',
            link: 'docs/redux.md'
          }
        ],
        lifecycles: [
          {
            name: 'nextConfig',
            method: 'execWaterfall',
            description: 'Setup the next config',
            link: 'README.md#nextConfig',
            parent: 'express'
          },
          {
            name: 'next',
            method: 'exec',
            description: 'Update the next app instance before prepare',
            link: 'README.md#next',
            parent: 'express',
            after: 'nextConfig'
          },
          {
            name: 'nextExpress',
            method: 'exec',
            description: 'Access the prepared next app and express instance',
            link: 'README.md#nextExpress',
            parent: 'express',
            after: 'next'
          }
        ],
        structures: [
          {
            name: 'pages/',
            description: 'NextJS routing',
            link: 'https://nextjs.org/docs/routing/introduction'
          },
          {
            name: 'public/',
            description: 'NextJS static files',
            link: 'https://nextjs.org/docs/basic-features/static-file-serving'
          }
        ]
      };
    }
  }
};
