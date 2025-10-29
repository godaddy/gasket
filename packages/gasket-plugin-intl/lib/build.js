/// <reference types="@gasket/plugin-command" />

/** @type {import('@gasket/core').HookHandler<'build'>} */
import { getIntlConfig } from './utils/configure-utils.js';
import buildManifest from './build-manifest.js';
import buildModules from './build-modules.js';

async function build(gasket) {

  const intlConfig = getIntlConfig(gasket);
  if (intlConfig.modules) {
    await buildModules(gasket);
  }
  await buildManifest(gasket);
}

export default {
  timing: {
    first: true
  },
  handler: build
};
