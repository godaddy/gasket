const { name, version } = require('../package.json');

/** @type {import('@gasket/core').HookHandler<'create'>} */
module.exports = function create(gasket, { pkg, gasketConfig }) {
  gasketConfig.addPlugin('pluginMetadata', name);
  pkg.add('dependencies', {
    [name]: `^${version}`
  });
};
