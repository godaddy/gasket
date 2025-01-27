/// <reference types="create-gasket-app" />

import pkg from '../package.json' with { type: 'json' };
const { name, version } = pkg;

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default function create(gasket, { pkg, gasketConfig }) {
  gasketConfig.addPlugin('pluginCommand', name);
  pkg.add('dependencies', {
    [name]: `^${version}`
  });
}
