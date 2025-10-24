import { readFile } from 'node:fs/promises';
const defaultConfig = new URL('../generator/docusaurus.config.js', import.meta.url).pathname;

/**
 * Generate base docusaurus config
 * @param {import('./index.d.ts').BaseConfig} configOptions - Docusaurus config options that will be added to the root config
 * @returns {Promise<string>} - docusaurus config file
 */
export default async function generateDefaultConfig(configOptions) {
  const configStr = await readFile(defaultConfig, 'utf-8');
  return configStr.replace(/\$\{(\w+)\}/g, (full, propName) => {
    return configOptions[propName];
  });
}
