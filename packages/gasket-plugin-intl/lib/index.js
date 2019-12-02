const path = require('path');
const serveStatic = require('serve-static');
const Builder = require('./builder');
const workbox = require('./workbox');
const serviceWorkerCacheKey = require('./service-worker-cache-key');
const init = require('./init');
const {
  getAssetPrefix,
  getDefaultLanguage,
  getIntlConfig,
  getIntlLanguageMap,
  getOutputDir,
  loadLocalesManifest
} = require('./utils');

/**
 * Plugin build hook
 *
 * @param {Object} gasket - Gasket config
 **/
async function build(gasket) {
  const builder = new Builder(gasket.logger, getIntlConfig(gasket));
  await builder.run();
}

module.exports = {
  dependencies: ['log'],
  name: require('../package').name,
  hooks: {
    init,
    async initReduxState(gasket, state, req) {
      const acceptLanguage = (req.headers['accept-language'] || '').split(',')[0];
      const language = await gasket.execWaterfall('intlLanguage', acceptLanguage, req);
      return {
        ...state,
        intl: {
          language,
          assetPrefix: getAssetPrefix(gasket),
          languageMap: getIntlLanguageMap(gasket),
          defaultLanguage: getDefaultLanguage(gasket)
        }
      };
    },
    async create(gasket, { files, pkg }) {
      const rootDir = path.join(__dirname, '..');
      files.add(
        `${rootDir}/generator/*`,
        `${rootDir}/generator/**/*`
      );

      pkg.add('dependencies', {
        '@gasket/intl': '^4.0.0',
        'react-intl': '^2.9.0'
      });
    },
    build,
    middleware(gasket) {
      //
      // Make the outputDir available from req for loading locale files
      // during SSR in HOCs
      //
      return (req, res, next) => {
        req.localesDir = getOutputDir(gasket);
        next();
      };
    },
    express(gasket, app) {
      const outputDir = getOutputDir(gasket);

      app.use('/_locales', serveStatic(outputDir, {
        index: false,
        maxAge: '1y',
        immutable: true
      }));

      //
      // This is generally loading into Redux during SSR but available otherwise
      //
      app.get('/locales-manifest.json', async (req, res) => {
        const data = loadLocalesManifest(outputDir);
        res.send(data);
      });
    },
    workbox,
    serviceWorkerCacheKey,
    metadata(gasket, meta) {
      const config = getIntlConfig(gasket);
      return {
        ...meta,
        lifecycles: [{
          name: 'intlLanguage',
          method: 'execWaterfall',
          description: 'Set the language for which locale files to load',
          link: 'README.md#intlLanguage',
          parent: 'initReduxState'
        }],
        structures: [{
          name: config.localesDir + '/',
          description: 'Locale JSON files with translation strings',
          link: 'README.md#Options'
        }]
      };
    }
  }
};
