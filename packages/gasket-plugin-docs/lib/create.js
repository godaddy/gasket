const { name } = require('../package.json');
const { defaultConfig } = require('./configure');

module.exports = function create(_gasket, { gasketConfig, gitignore }) {
  gitignore?.add(defaultConfig.outputDir, 'Documentation');
  gasketConfig.addPlugin('pluginDocs', name);
};
