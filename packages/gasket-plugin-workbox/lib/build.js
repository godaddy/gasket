/// <reference types="@gasket/plugin-start" />

const { copyWorkboxLibraries } = require('workbox-build');
const { getOutputDir } = require('./utils');

/**
 * Build lifecycle to copy workbox libraries for serving
 * @type {import('@gasket/engine').HookHandler<'build'>}
 */
module.exports = async function build(gasket) {
  const buildDir = getOutputDir(gasket);
  await copyWorkboxLibraries(buildDir);
};
