const path = require('path');
const { name, devDependencies } = require('../package');
const configure = require('./configure');
const init = require('./init');
const middleware = require('./middleware');
const serve = require('./serve');
const serviceWorkerCacheKey = require('./service-worker-cache-key');
const workbox = require('./workbox');
const buildManifest = require('./build-manifest');
const buildModules = require('./build-modules');
const { getIntlConfig } = require('./configure');

module.exports = {
  dependencies: ['@gasket/plugin-log'],
  name,
  hooks: {
    init,
    configure,
    async create(gasket, context) {
      const { files, pkg } = context;
      const rootDir = path.join(__dirname, '..');
      const isReactProject = pkg.has('dependencies', 'react');

      files.add(`${rootDir}/generator/*`, `${rootDir}/generator/**/*`);

      if (isReactProject) {
        pkg.add('dependencies', {
          '@gasket/react-intl': devDependencies['@gasket/react-intl'],
          'react-intl': devDependencies['react-intl']
        });

        context.hasGasketIntl = true;
      }
    },
    build: {
      timing: {
        first: true
      },
      handler: async function build(gasket) {
        const intlConfig = getIntlConfig(gasket);
        if (intlConfig.modules) {
          await buildModules(gasket);
        }
        await buildManifest(gasket);
      }
    },
    webpackConfig(gasket, webpackConfig, { webpack }) {
      return {
        ...webpackConfig,
        plugins: [
          ...(webpackConfig.plugins || []),
          new webpack.EnvironmentPlugin([
            'GASKET_INTL_LOCALES_DIR',
            'GASKET_INTL_MANIFEST_FILE'
          ])
        ]
      };
    },
    express: serve,
    fastify: serve,
    middleware,
    workbox,
    serviceWorkerCacheKey,
    metadata(gasket, meta) {
      const { localesDir } = getIntlConfig(gasket);
      return {
        ...meta,
        lifecycles: [{
          name: 'intlLocale',
          method: 'execWaterfall',
          description: 'Set the language for which locale files to load',
          link: 'README.md#intlLocale',
          parent: 'middleware'
        }],
        structures: [{
          name: localesDir + '/',
          description: 'Locale JSON files with translation strings',
          link: 'README.md#Options'
        }],
        configurations: [{
          name: 'intl',
          link: 'README.md#configuration',
          description: 'Intl config object',
          type: 'object'
        }, {
          name: 'intl.basePath',
          link: 'README.md#configuration',
          description: 'Base URL where locale files are served',
          type: 'string'
        }, {
          name: 'intl.defaultPath',
          link: 'README.md#configuration',
          description: 'Path to endpoint with JSON files',
          type: 'string'
        }, {
          name: 'intl.localesPath',
          link: 'README.md#locals-path',
          description: 'URL endpoint where static JSON files are available',
          type: 'string'
        }, {
          name: 'intl.defaultLocale',
          link: 'README.md#configuration',
          description: 'Locale to fallback to when loading files',
          type: 'string',
          default: 'en'
        }, {
          name: 'intl.locales',
          link: 'README.md#configuration',
          description: 'Ordered list of accepted locales',
          type: 'string[]'
        }, {
          name: 'intl.localesMap',
          link: 'README.md#configuration',
          description: 'Mapping of locales to share files',
          type: 'object'
        }, {
          name: 'intl.localesDir',
          link: 'README.md#configuration',
          description: 'Path to on-disk directory where locale files exists',
          type: 'string',
          default: './public/locales'
        }, {
          name: 'intl.manifestFilename',
          link: 'README.md#configuration',
          description: 'Change the name of the manifest file',
          type: 'string',
          default: 'locales-manifest.json'
        }, {
          name: 'intl.serveStatic',
          link: 'README.md#configuration',
          description: 'Enables ability to serve static locale files',
          type: 'boolean/string',
          default: 'locales-manifest.json'
        }, {
          name: 'intl.modules',
          link: 'README.md#configuration',
          description: 'Enable locale files collation from node modules',
          type: 'boolean/object',
          default: true
        }]
      };
    }
  }
};
