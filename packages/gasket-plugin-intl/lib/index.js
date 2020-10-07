const path = require('path');
const { name, devDependencies } = require('../package');
const configure = require('./configure');
const init = require('./init');
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
      files.add(
        `${ rootDir }/generator/*`,
        `${ rootDir }/generator/**/*`
      );

      pkg.add('dependencies', {
        '@gasket/intl': devDependencies['@gasket/intl'],
        'react-intl': devDependencies['react-intl']
      });

      context.hasGasketIntl = true;
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
    webpack() {
      // webpack is not listed as a required dependency but if this lifecycle
      // is invoked we can assume it has been installed by @gasket/plugin-webpack
      const webpack = require('webpack');

      return {
        plugins: [
          new webpack.EnvironmentPlugin([
            'GASKET_INTL_LOCALES_DIR',
            'GASKET_INTL_MANIFEST_FILE'
          ])
        ]
      };
    },
    middleware(gasket) {
      const { basePath, localesMap } = getIntlConfig(gasket);

      return async function intlMiddleware(req, res, next) {
        const acceptLanguage = (req.headers['accept-language'] || '').split(',')[0];
        const locale = await gasket.execWaterfall('intlLocale', acceptLanguage, req);
        const mappedLocale = localesMap && localesMap[locale] || locale;
        // The gasketData object make certain config data available for server
        // rendering, which it can also be rendered as a browser global object
        res.gasketData = res.gasketData || {};
        res.gasketData.intl = {
          locale: mappedLocale,
          basePath
        };
        next();
      };
    },
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
        }]
      };
    }
  }
};
