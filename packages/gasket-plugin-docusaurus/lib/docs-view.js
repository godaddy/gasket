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

function checkDevDependencies(gasket) {
  const preset = tryRequire('@docusaurus/preset-classic');
  const core = tryRequire('@docusaurus/core');
  if (!preset || !core) {
    gasket.logger.error('Missing devDependencies. Please run `npm i -D @docusaurus/core @docusaurus/preset-classic`');
    process.exit(1);
  }
}

module.exports = async function docsView(gasket) {
  checkDevDependencies(gasket);
  const { start } = require('@docusaurus/core/lib');
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
