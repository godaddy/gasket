const defaultsDeep = require('lodash.defaultsdeep');
const { existsSync } = require('fs');
const { writeFile } = require('fs').promises;
const path = require('path');
const { tryRequire } = require('@gasket/utils');
const generateDefaultConfig = require('./generate-default-config');
const pluginConfigFile = 'docusaurus.config.js';
const defaultConfig = {
  port: 3000,
  host: 'localhost'
};

function checkDevDependencies() {
  const preset = tryRequire('@docusaurus/preset-classic');
  const core = tryRequire('@docusaurus/core');
  if (!preset || !core) {
    throw new Error('Missing devDependencies. Please run `npm i -D @docusaurus/core @docusaurus/preset-classic`');
  }
}

module.exports = async function docsView(gasket) {
  checkDevDependencies();
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
