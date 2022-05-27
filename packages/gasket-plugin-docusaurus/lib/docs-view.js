const defaultsDeep = require('lodash.defaultsdeep');
const { existsSync } = require('fs');
const { writeFile } = require('fs').promises;
const path = require('path');
const generateDefaultConfig = require('./generate-default-config');
const pluginConfigFile = 'docusaurus.config.js';
const defaultConfig = {
  port: 3000,
  host: 'localhost'
};

module.exports = async function docsView(gasket, docsConfigSet) {
  const { start } = require('@docusaurus/core/lib');
  const { docsRoot } = docsConfigSet;
  const { root } = gasket.config;
  const { name } = gasket.metadata.app;
  const userConfig = gasket.config.docusaurus;
  const configFilePath = path.join(root, pluginConfigFile);
  const docusaurusConfig = defaultsDeep({ config: configFilePath }, userConfig, defaultConfig);

  if (!existsSync(configFilePath)) {
    const defaultDocusaurusConfig = await generateDefaultConfig({ name, path: docusaurusConfig.docsDir});

    await writeFile(configFilePath, defaultDocusaurusConfig, 'utf-8');
  }

  start(path.join(docsRoot, '..'), docusaurusConfig);
};
