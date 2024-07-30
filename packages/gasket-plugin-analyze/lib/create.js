/// <reference types="create-gasket-app" />
const { name, version } = require('../package.json');

/**
 * Add files & extend package.json for new apps.
 * @type {import('@gasket/core').HookHandler<'create'>}
 */
module.exports = function create(gasket, { pkg, gasketConfig }) {
  gasketConfig.addPlugin('pluginAnalyze', name);
  pkg.add('devDependencies', {
    [name]: `^${version}`
  });

  pkg.add('scripts', {
    analyze: 'GASKET_ENV=local ANALYZE=true next build'
  });
};
