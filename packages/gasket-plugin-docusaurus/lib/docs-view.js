const defaultsDeep = require('lodash.defaultsdeep');
const { writeFile, readFile } = require('fs').promises;
const { start } = require('@docusaurus/core/lib');
const path = require('path');
const pluginConfigFile = 'docusaurus.config.js';
const generateDefaultConfig = require('./generate-default-config');

// https://docusaurus.io/docs/cli#docusaurus-start-sitedir
const defaultConfig = {
  port: 3000,
  host: 'localhost'
};

module.exports = async function docsView(gasket, docsConfigSet) {
  const { docsRoot } = docsConfigSet;
  const { root } = gasket.config;
  const { name } = gasket.metadata.app;
  const userConfig = gasket.config.docusaurus || {};
  const docusaurusConfig = defaultsDeep(
    {
      config: path.join(root, pluginConfigFile)
    },
    userConfig,
    defaultConfig
  );

  try {
    await readFile(path.join(root, pluginConfigFile));
  } catch (error) {
    await writeFile(
      path.join(root, pluginConfigFile),
      Buffer.from(generateDefaultConfig(name)),
      'utf-8'
    );
  }

  start(path.join(docsRoot, '..'), docusaurusConfig);
};
