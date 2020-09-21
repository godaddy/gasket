const path = require('path');
const serveStatic = require('serve-static');
const { name, devDependencies } = require('../package');
const Builder = require('./builder');
const workbox = require('./workbox');
const defaultConfig = require('./default-config');
const serviceWorkerCacheKey = require('./service-worker-cache-key');
const init = require('./init');
const { getIntlConfig } = require('./utils');

/**
 * Plugin build hook
 *
 * @param {Object} gasket - Gasket config
 **/
async function build(gasket) {
  const intlConfig = gasket.config.intl;
  const builder = new Builder(gasket.logger, intlConfig);
  await builder.run();
}

module.exports = {
  dependencies: ['@gasket/plugin-log'],
  name,
  hooks: {
    init,
    async create(gasket, context) {
      const { files, pkg, reduxReducers } = context;
      const rootDir = path.join(__dirname, '..');
      files.add(
        `${ rootDir }/generator/*`,
        `${ rootDir }/generator/**/*`
      );

      pkg.add('dependencies', {
        '@gasket/intl': devDependencies['@gasket/intl'],
        'react-intl': devDependencies['react-intl']
      });

      reduxReducers.addImport(`const intlReducers = require('@gasket/intl/reducers');`);
      reduxReducers.addEntry(`...intlReducers,`);

      context.hasGasketIntl = true;
    },
    build: {
      timing: {
        first: true
      },
      handler: build
    },
    // start: async function start(gasket) {
    //   const intlConfig = gasket.config.intl;
    //   const { localesDir } = intlConfig;
    //   // global.gasketIntl.manifest = loadLocalesManifest(localesDir);
    // },
    configure(gasket, config) {
      const { root } = config;
      // get user defined config and apply defaults
      const intlConfig = { ...defaultConfig, ...getIntlConfig({ config }) };

      const { languageMap, defaultLanguage } = intlConfig;
      // TODO: deprecated warnings for `languageMap`, `defaultLanguage`
      const {
        outputDir,
        localeMap = languageMap,
        defaultLocale = defaultLanguage || 'en-US'
      } = intlConfig;

      const fullOutputDir = path.join(root, outputDir);

      const { next = {}, intl = {}, zone } = config;
      const assetPrefix = intl.assetPrefix || next.assetPrefix || zone || '';

      // This allows packages (@gasket/intl) to reference certain configs
      /* eslint-disable no-process-env */
      process.env.GASKET_INTL_LOCALES_DIR = fullOutputDir;
      process.env.GASKET_INTL_MANIFEST_FILE = path.join(fullOutputDir, 'locales-manifest.json');
      /* eslint-enable no-process-env */

      return {
        ...config,
        intl: {
          ...intlConfig,
          outputDir: fullOutputDir,
          assetPrefix,
          localeMap,
          defaultLocale
        }
      };
    },
    webpack(gasket) {
      const { outputDir } = getIntlConfig(gasket);
      // webpack is not listed as a required dependency but if this lifecycle
      // is invoked we can assume it has been installed by @gasket/plugin-webpack
      const webpack = require('webpack');

      return {
        plugins: [
          new webpack.EnvironmentPlugin({
            GASKET_INTL_LOCALES_DIR: outputDir,
            GASKET_INTL_MANIFEST_FILE: path.join(outputDir, 'locales-manifest.json')
          })
        ]
      };
    },
    middleware(gasket) {
      const { assetPrefix } = getIntlConfig(gasket);

      return async function intlMiddleware(req, res, next) {
        const acceptLanguage = (req.headers['accept-language'] || '').split(',')[0];
        const locale = await gasket.execWaterfall('intlLocale', acceptLanguage, req);
        req.gasketIntl = {
          locale,
          assetPrefix
        };
        next();
      };
    },
    express(gasket, app) {
      const { outputDir, assetPrefix } = getIntlConfig(gasket);

      app.use('/_locales', serveStatic(outputDir, {
        index: false,
        maxAge: '1y',
        immutable: true
      }));

      //
      // This is generally loading into Redux during SSR but available otherwise
      //
      app.get('/locales-settings.json', async (req, res) => {
        const { locale } = req.gasketIntl;
        res.send({
          locale,
          // because this can change per environment, we need to be able to fetch from browser
          assetPrefix
        });
      });
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
          parent: 'initReduxState'
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
