const path = require('path');
const { name, devDependencies } = require('../package');
const configure = require('./configure');
const init = require('./init');
const middleware = require('./middleware');
const express = require('./express');
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

      files.add(
        `${rootDir}/generator/*`,
        `${rootDir}/generator/**/*`
      );

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
    express,
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
        }]
      };
    }
  }
};
