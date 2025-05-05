/// <reference types="@gasket/plugin-command" />

/** @type {import('@gasket/core').HookHandler<'build'>} */
async function build(gasket) {
  const { getIntlConfig } = require('./utils/configure-utils');
  const buildManifest = require('./build-manifest');
  const buildModules = require('./build-modules');

  const intlConfig = getIntlConfig(gasket);
  if (intlConfig.modules) {
    await buildModules(gasket);
  }
  await buildManifest(gasket);
}

module.exports = {
  timing: {
    first: true
  },
  handler: build
};
