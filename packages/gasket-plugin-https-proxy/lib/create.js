import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkgJson = require('../package.json');
const { name, version } = pkgJson;

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default function create(gasket, { pkg, gasketConfig }) {
  gasketConfig.addPlugin('pluginHttpsProxy', name);
  pkg.add('dependencies', {
    [name]: `^${version}`
  });
}
