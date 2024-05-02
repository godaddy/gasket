const { name, version } = require('../package.json');
const { defaultConfig } = require('./configure');

module.exports = function create(_gasket, { pkg, gasketConfig, gitignore }) {
  gitignore?.add(defaultConfig.outputDir, 'Documentation');
  gasketConfig.addPlugin('pluginDocs', name);
  pkg.add('dependencies', {
    [name]: `^${version}`
  });
};
