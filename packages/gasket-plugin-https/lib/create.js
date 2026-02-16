import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

const packageInfo = JSON.parse(readFileSync(join(dirName, '../package.json'), 'utf8'));
const { name, version } = packageInfo;

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default async function create(gasket, { pkg, gasketConfig }) {
  gasketConfig.addPlugin('pluginHttps', name);
  pkg.add('dependencies', {
    [name]: `^${version}`
  });
}
