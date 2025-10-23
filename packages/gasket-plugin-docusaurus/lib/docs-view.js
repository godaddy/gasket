import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import generateDefaultConfig from './generate-default-config.js';
const pluginConfigFile = 'docusaurus.config.js';
const defaultConfig = {
  port: '3000',
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
async function checkDevDependencies() {
  try {
    await import('@docusaurus/preset-classic');
    await import('@docusaurus/core/package.json');
  } catch {
    throw new Error(
      'Missing devDependencies. Please run `npm i -D @docusaurus/core @docusaurus/preset-classic`'
    );
  }
}

/** @type {import('@gasket/core').HookHandler<'docsView'>} */
export default async function docsView(gasket) {
  await checkDevDependencies();
  // @ts-expect-error - TODO: add types for @docusaurus/core
  const { start } = await import('@docusaurus/core');
  const { config } = gasket;
  const { app: { name } } = await gasket.actions.getMetadata();
  const userConfig = gasket.config.docusaurus;
  const configFilePath = path.join(config.root, pluginConfigFile);

  /** @type {import('./index.js').DocusaurusConfig} */
  const docusaurusConfig = {
    ...defaultConfig,
    ...userConfig
  };
  const { rootDir, docsDir } = docusaurusConfig;

  if (!existsSync(configFilePath)) {
    const defaultDocusaurusConfig = await generateDefaultConfig({
      name,
      path: docsDir
    });

    await createPackageFile(path.join(config.root, docusaurusConfig.rootDir));
    await writeFile(configFilePath, defaultDocusaurusConfig, 'utf-8');
  }

  start(path.join(config.root, rootDir), {
    ...docusaurusConfig,
    config: configFilePath
  });
}
