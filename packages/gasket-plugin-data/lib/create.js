/// <reference types="create-gasket-app" />
/// <reference types="@gasket/core" />

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import packageJson from '../package.json' with { type: 'json' };
const { name, version, devDependencies } = packageJson;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @type {import('@gasket/core').HookHandler<'create'>}
 */
export default async function create(gasket, {
  pkg,
  files,
  gasketConfig,
  typescript
}) {
  pkg.add('dependencies', {
    [name]: `^${version}`,
    '@gasket/data': devDependencies['@gasket/data']
  });

  const generatorDir = join(__dirname, '..', 'generator');
  const glob = typescript ? '*.ts' : '*.js';
  files.add(
    `${generatorDir}/${glob}`
  );

  gasketConfig
    .addPlugin('pluginData', name);

  gasketConfig
    .addImport('gasketData', `./gasket-data.js`)
    .injectValue('data', 'gasketData');
}
