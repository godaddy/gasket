const { copyWorkboxLibraries } = require('workbox-build');
const { getOutputDir } = require('./utils');

/**
 * Build lifecycle to copy workbox libraries for serving
 *
 * @param {Gasket} gasket - Gasket
 * @returns {Promise} promise
 */
module.exports = async function build(gasket) {
  const buildDir = getOutputDir(gasket);
  await copyWorkboxLibraries(buildDir);
};
