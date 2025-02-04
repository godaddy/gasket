const { name, version } = require('../package.json');

/** @type {import('@gasket/core').HookHandler<'create'>} */
module.exports = async function create(gasket, { pkg, gasketConfig }) {
  gasketConfig.addPlugin('pluginHttps', name);
  pkg.add('dependencies', {
    [name]: `^${version}`
  });
};
