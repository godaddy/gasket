const defaultsDeep = require('lodash.defaultsdeep');
const { existsSync } = require('fs');
const { writeFile, readFile } = require('fs').promises;
const path = require('path');
const generateDefaultConfig = require('./generate-default-config');
const pluginConfigFile = 'docusaurus.config.js';
const defaultConfig = {
  port: 3000,
  host: 'localhost'
};

module.exports = async function docsView(gasket) {
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

  await writeFile(
    path.join(config.root, rootDir, docsDir, 'LICENSE.md'),
    await readFile(path.join(__dirname, '..', 'LICENSE.md'), 'utf-8'),
    'utf-8'
  );

  start(path.join(config.root, rootDir), docusaurusConfig);
};
