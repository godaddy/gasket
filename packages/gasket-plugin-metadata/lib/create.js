const { name, version } = require('../package.json');

module.exports = function create(gasket, { pkg, gasketConfig }) {
  gasketConfig.addPlugin('pluginMetadata', name);
  pkg.add('dependencies', {
    [name]: `^${version}`
  });
};
