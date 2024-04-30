const { readFile } = require('fs').promises;
const path = require('path');
const defaultConfig = path.join(
  __dirname,
  '..',
  'generator',
  'docusaurus.config.js'
);

/**
 * Generate base docusaurus config
 * @param {import('./index').BaseConfig} configOptions - Docusaurus config options that will be added to the root config
 * @returns {Promise<string>} - docusaurus config file
 */
module.exports = async function generateDefaultConfig(configOptions) {
  const configStr = await readFile(defaultConfig, 'utf-8');
  return configStr.replace(/\$\{(\w+)\}/g, (full, propName) => {
    return configOptions[propName];
  });
};
