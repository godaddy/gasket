/// <reference types="@gasket/plugin-start" />

const { getIntlConfig } = require('./configure');
const buildManifest = require('./build-manifest');
const buildModules = require('./build-modules');

/** @type {import('@gasket/core').HookHandler<'build'>} */
async function build(gasket) {
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
