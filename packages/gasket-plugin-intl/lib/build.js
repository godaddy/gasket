const { getIntlConfig } = require('./configure');
const buildManifest = require('./build-manifest');
const buildModules = require('./build-modules');

// @ts-expect-error - TODO: will be cleaned up in tune up ticket
// https://godaddy-corp.atlassian.net/browse/PFX-624
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
