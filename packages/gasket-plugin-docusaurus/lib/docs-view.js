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

/**
 * Drops a package.json file in the docs root so that Docusaurus
 * does not complain about type: module if in the root package.json.
 * @param {string} docsRoot - The docs root directory
 */
async function createPackageFile(docsRoot) {
  const target = path.join(docsRoot, 'package.json');
  await writeFile(target, JSON.stringify({}), 'utf-8');
}

/**
 * Check if devDependencies are installed
 */
function checkDevDependencies() {
  try {
    require('@docusaurus/preset-classic');
    require('@docusaurus/core/package.json');
  } catch (err) {
    throw new Error(
      'Missing devDependencies. Please run `npm i -D @docusaurus/core @docusaurus/preset-classic`'
    );
  }
}

/** @type {import('@gasket/core').HookHandler<'docsView'>} */
module.exports = async function docsView(gasket) {
  checkDevDependencies();
  const { start } = require('@docusaurus/core/lib');
  const { config } = gasket;
  const { app: { name } } = await gasket.actions.getMetadata();
  const userConfig = gasket.config.docusaurus;
  const configFilePath = path.join(config.root, pluginConfigFile);

  /** @type {import('./index').DocusaurusConfig} */
  const docusaurusConfig = defaultsDeep(
    { config: configFilePath },
    userConfig,
    defaultConfig
  );
  const { rootDir, docsDir } = docusaurusConfig;

  if (!existsSync(configFilePath)) {
    const defaultDocusaurusConfig = await generateDefaultConfig({
      name,
      path: docsDir
    });

    await createPackageFile(path.join(config.root, docusaurusConfig.rootDir));
    await writeFile(configFilePath, defaultDocusaurusConfig, 'utf-8');
  }

  start(path.join(config.root, rootDir), docusaurusConfig);
};
