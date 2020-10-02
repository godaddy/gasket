const path = require('path');
const { name, devDependencies } = require('../package');
const buildModules = require('./builder');
const workbox = require('./workbox');
const serviceWorkerCacheKey = require('./service-worker-cache-key');
const init = require('./init');
const buildManifest = require('./build-manifest');
const { getIntlConfig } = require('./utils');

const moduleDefaults = {
  localesDir: 'locales',
  excludes: ['cacache', 'yargs', 'axe-core']
};

module.exports = {
  dependencies: ['@gasket/plugin-log'],
  name,
  hooks: {
    init,
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
    configure(gasket, config) {
      const { root } = config;
      const intlConfig = { ...getIntlConfig({ config }) };

      // TODO: deprecated warnings for `languageMap`, `defaultLanguage`
      const { languageMap, defaultLanguage } = intlConfig;

      // get user defined config and apply defaults
      const {
        defaultPath = '/locales',
        defaultLocale = defaultLanguage || 'en-US',
        localesMap = languageMap,
        localesDir = './public/locales',
        manifestFilename = 'locales-manifest.json'
      } = intlConfig;

      const fullLocalesDir = path.join(root, localesDir);

      const { next = {} } = config;
      const basePath = intlConfig.basePath || intlConfig.assetPrefix ||
        next.basePath || next.assetPrefix ||
        config.basePath || '';

      let { modules = false } = intlConfig;
      if (modules) {
        modules = modules === true ? moduleDefaults : { ...moduleDefaults, ...modules };
      }

      // This allows packages (@gasket/intl) to reference certain configs
      /* eslint-disable no-process-env */
      process.env.GASKET_INTL_LOCALES_DIR = fullLocalesDir;
      process.env.GASKET_INTL_MANIFEST_FILE = path.join(fullLocalesDir, manifestFilename);
      /* eslint-enable no-process-env */

      return {
        ...config,
        intl: {
          ...intlConfig,
          basePath,
          defaultPath,
          defaultLocale,
          localesMap,
          localesDir: fullLocalesDir,
          manifestFilename,
          modules
        }
      };
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
      const { basePath } = getIntlConfig(gasket);

      return async function intlMiddleware(req, res, next) {
        const acceptLanguage = (req.headers['accept-language'] || '').split(',')[0];
        const locale = await gasket.execWaterfall('intlLocale', acceptLanguage, req);
        // The gasketData object make certain config data available for server
        // rendering, which it can also be rendered as a browser global object
        res.gasketData = res.gasketData || {};
        res.gasketData.intl = {
          locale,
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
