const { readFile } = require('fs').promises;
const path = require('path');
const defaultConfig = path.join(__dirname, '..', 'generator', 'docusaurus.config.js');

/**
 * Generate base docusaurus config
 *
 * @param {string} name - Name of the Gasket app - defines meta info in the config
 * @returns {string} - docusaurus config file
 */
module.exports = async function generateDefaultConfig(name) {
  let configStr;
  configStr = await readFile(defaultConfig, 'utf-8');
  configStr = configStr.replace(/(\$\{name\})/g, name);
  return configStr;
};
