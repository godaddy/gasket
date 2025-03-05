/// <reference types="@gasket/plugin-command" />

const { copyWorkboxLibraries } = require('workbox-build');
const { getOutputDir } = require('./utils');

/** @type {import('@gasket/core').HookHandler<'build'>} */
module.exports = async function build(gasket) {
  const buildDir = getOutputDir(gasket);
  await copyWorkboxLibraries(buildDir);
};
