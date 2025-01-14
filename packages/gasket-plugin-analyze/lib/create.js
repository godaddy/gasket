/// <reference types="create-gasket-app" />
const { name, version } = require('../package.json');

/**
 * Add files & extend package.json for new apps.
 * @type {import('@gasket/core').HookHandler<'create'>}
 */
module.exports = function create(gasket, { pkg, gasketConfig }) {
  gasketConfig.addEnvironment('local.analyze', {
    dynamicPlugins: [
      '@gasket/plugin-analyze'
    ]
  });

  pkg.add('devDependencies', {
    [name]: `^${version}`
  });

  pkg.add('scripts', {
    analyze: 'GASKET_ENV=local.analyze ANALYZE=1 next build'
  });
};
