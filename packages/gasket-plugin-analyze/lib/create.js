/// <reference types="create-gasket-app" />
const { name, version } = require('../package.json');

/**
 * Add files & extend package.json for new apps.
 * @type {import('@gasket/core').HookHandler<'create'>}
 */
module.exports = function create(gasket, { pkg, gasketConfig }) {
  console.log('Adding Gasket Analyze plugin to your app...');
  gasketConfig.addEnvironment('local.analyze', {
    dynamicPlugins: [
      '@gasket/plugin-analyze'
    ]
  });

  pkg.add('devDependencies', {
    [name]: `^${version}`
  });

  pkg.add('scripts', {
    analyze: 'GASKET_ENV=local.analyze next build'
  });
};
