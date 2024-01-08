const defaultsDeep = require('lodash.defaultsdeep');
const { existsSync } = require('fs');
const { writeFile } = require('fs').promises;
const path = require('path');
const { requireWithInstall, runShellCommand, tryRequire } = require('@gasket/utils');
const generateDefaultConfig = require('./generate-default-config');
const pluginConfigFile = 'docusaurus.config.js';
const defaultConfig = {
  port: 3000,
  host: 'localhost'
};

async function handleDevDependencies(gasket) {
  const preset = tryRequire('@docusaurus/preset-classic');
  if (!preset) {
    gasket.logger.info('Installing devDependencie(s) - installing "@docusaurus/preset-classic" with "npm" - save as a devDependency to avoid this');
    await runShellCommand('npm', ['install', '@docusaurus/preset-classic', '--no-save']);
  }
}

module.exports = async function docsView(gasket) {
  await handleDevDependencies(gasket);
  const { start } = await requireWithInstall('@docusaurus/core/lib', gasket);
  const { config } = gasket;
  const { name } = gasket.metadata.app;
  const userConfig = gasket.config.docusaurus;
  const configFilePath = path.join(config.root, pluginConfigFile);
  const docusaurusConfig = defaultsDeep({ config: configFilePath }, userConfig, defaultConfig);
  const { rootDir, docsDir } = docusaurusConfig;

  if (!existsSync(configFilePath)) {
    const defaultDocusaurusConfig = await generateDefaultConfig({ name, path: docsDir });

    await writeFile(configFilePath, defaultDocusaurusConfig, 'utf-8');
  }

  start(path.join(config.root, rootDir), docusaurusConfig);
};
