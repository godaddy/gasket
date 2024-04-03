const path = require('path');
const url = require('url');
const { name, devDependencies } = require('../package');
const { createConfig } = require('./config');
const { pluginIdentifier } = require('@gasket/resolve');
const { setupNextApp, setupNextHandling } = require('./setup-next-app');
const getNextRoute = require('./next-route');
const apmTransaction = require('./apm-transaction');
const configure = require('./configure');
const metadata = require('./metadata');

const isDefined = (o) => typeof o !== 'undefined';

module.exports = {
  dependencies: ['@gasket/plugin-webpack'],
  name,
  hooks: {
    configure,
    actions(gasket) {
      return {
        getNextConfig(nextConfig) {
          return async function setupNextConfig(phase, { defaultConfig }) {
            let baseConfig;
            if (nextConfig instanceof Function) {
              baseConfig = await nextConfig(phase, { defaultConfig });
            } else {
              baseConfig = nextConfig ?? {};
            }
            return createConfig(gasket, phase === 'phase-production-build', baseConfig);
          };
        }
      };
    },
    async prompt(gasket, context, { prompt }) {
      if (!('addSitemap' in context)) {
        const { addSitemap } = await prompt([
          {
            name: 'addSitemap',
            message: 'Do you want to add a sitemap?',
            type: 'confirm'
          }
        ]);
        return { ...context, addSitemap };
      }
      return context;
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
        const { files, pkg, testPlugin, addSitemap } = context;
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

        if (addSitemap) {
          pkg.add('dependencies', {
            'next-sitemap': '^3.1.29'
          });

          files.add(`${generatorDir}/sitemap/*`);
          pkg.add('scripts', {
            sitemap: 'next-sitemap'
          });
        }

        if (pkg.has('dependencies', '@gasket/redux')) {
          pkg.add('dependencies', {
            'next-redux-wrapper': devDependencies['next-redux-wrapper'],
            'lodash.merge': devDependencies['lodash.merge']
          });

          files.add(`${generatorDir}/redux/*`, `${generatorDir}/redux/**/*`);
        }
      }
    },
    middleware: {
      timing: {
        before: ['@gasket/plugin-elastic-apm']
      },
      handler: (gasket) => [
        (req, _res, next) => {
          req.getNextRoute = () => getNextRoute(gasket, req);
          next();
        }
      ]
    },
    express: {
      timing: {
        last: true
      },
      handler: async function express(gasket, expressApp) {
        const { exec } = gasket;
        const app = await setupNextApp(gasket);

        expressApp.set(['buildId', app.name].filter(Boolean).join('/'), app.buildId);

        await exec('nextExpress', { next: app, express: expressApp });

        // If the Gasket Intl Plugin is used to determine the locale, then we need
        // to let NextJS know that it has already been detected. We can do this by
        // forcing the `NEXT_LOCALE` cookie:
        // https://github.com/vercel/Next.js/blob/canary/docs/advanced-features/i18n-routing.md#leveraging-the-next_locale-cookie
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
        setupNextHandling(app, expressApp, gasket);

        return app;
      }
    },
    fastify: {
      timing: {
        last: true
      },
      handler: async function fastify(gasket, fastifyApp) {
        const { exec } = gasket;
        const app = await setupNextApp(gasket);

        fastifyApp.decorate(['buildId', app.name].filter(Boolean).join('/'), {
          getter() {
            return app.buildId;
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

        setupNextHandling(app, fastifyApp, gasket);

        return app;
      }
    },
    apmTransaction,
    build: async function build(gasket) {
      const { command } = gasket;
      // Don't do a build, use dev server for local
      if ((command.id || command) === 'local') return;

      const builder = require('next/dist/build').default;
      return await builder(path.resolve('.'), await createConfig(gasket, true));
    },
    /**
     * Workbox config partial to add Next.js static assets to precache
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
    metadata
  }
};
