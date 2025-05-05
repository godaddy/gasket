const { name, version } = require('../package.json');

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default function create(gasket, { pkg, gasketConfig }) {
  gasketConfig.addPlugin('pluginMetadata', name);
  pkg.add('devDependencies', {
    [name]: `^${version}`
  });
}
