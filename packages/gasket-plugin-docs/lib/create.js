const { defaultConfig } = require('./configure');

module.exports = function create(_gasket, { gitignore }) {
  gitignore?.add(defaultConfig.outputDir, 'Documentation');
};
