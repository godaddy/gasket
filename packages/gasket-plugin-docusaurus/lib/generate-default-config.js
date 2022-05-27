const { readFile } = require('fs').promises;
const path = require('path');
const defaultConfig = path.join(__dirname, '..', 'generator', 'docusaurus.config.js');

/**
 * Generate base docusaurus config
 *
 * @param {object} configOptions - Object to contain Docusaurus config options that will be added to the root config
 * @returns {string} - docusaurus config file
 */
module.exports = async function generateDefaultConfig(configOptions) {
  const configProperties = Object.keys(configOptions);
  let configStr = await readFile(defaultConfig, 'utf-8');

  configProperties.forEach(property => {
    const regex = `\${${property}}`.replace(/[${}]/g, '\\$&');
    configStr = configStr.replace(new RegExp(regex, 'g'), configOptions[property]);
  });

  return configStr;
};
