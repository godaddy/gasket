import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version } = require('../package.json');

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default function create(gasket, { pkg, gasketConfig }) {
  gasketConfig.addPlugin('pluginHttpsProxy', name);
  pkg.add('dependencies', {
    [name]: `^${version}`
  });
}
