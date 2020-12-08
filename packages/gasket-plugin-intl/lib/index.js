const path = require('path');
const merge = require('lodash.merge');
const { LocaleUtils } = require('@gasket/helper-intl');
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

      // TODO (@kinetifex): check if react is being added first
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
      const { defaultLocale, basePath, localesMap, localesDir, manifestFilename } = getIntlConfig(gasket);

      const manifest = require(path.join(localesDir, manifestFilename));
      const localesParentDir = path.dirname(localesDir);
      const localeUtils = new LocaleUtils({ manifest, basePath });

      return async function intlMiddleware(req, res, next) {
        /* eslint-disable require-atomic-updates */
        const acceptLanguage = (req.headers['accept-language'] || defaultLocale).split(',')[0];
        const locale = await gasket.execWaterfall('intlLocale', acceptLanguage, req, res);
        const mappedLocale = localesMap && localesMap[locale] || locale;

        /**
         * Gasket data to render as global object for browser access
         *
         * @typedef {LocalesProps} GasketIntlData
         * @property {string} [basePath] - Include base path if configured
         */
        const intlData = {
          locale: mappedLocale
        };
        if (basePath) intlData.basePath = basePath;

        /**
         * Load locale file(s) and return localesProps
         *
         * @param {LocalePathPart|LocalePathPart[]} localePathPath - Path(s) containing locale files
         * @returns {LocalesProps} localesProps
         */
        req.loadLocaleData = (localePathPath = manifest.defaultPath) => {
          return localeUtils.serverLoadData(localePathPath, mappedLocale, localesParentDir);
        };

        /**
         * Load locale data and makes available from gasketData
         *
         * @param {LocalePathPart|LocalePathPart[]} localePathPath - Path(s) containing locale files
         * @returns {LocalesProps} localesProps
         */
        req.withLocaleRequired = (localePathPath = manifest.defaultPath) => {
          const localesProps = req.loadLocaleData(localePathPath);
          merge(intlData, localesProps);
          return localesProps;
        };

        // The gasketData object allows certain config data to be available for
        // rendering as a global object for access in the browser.
        const { gasketData = {} } = res.locals;
        res.locals.gasketData = { ...gasketData, intl: intlData };
        next();
        /* eslint-enable require-atomic-updates */
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
