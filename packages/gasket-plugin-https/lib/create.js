import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageInfo = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
const { name, version } = packageInfo;

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default async function create(gasket, { pkg, gasketConfig }) {
  gasketConfig.addPlugin('pluginHttps', name);
  pkg.add('dependencies', {
    [name]: `^${version}`
  });
}
