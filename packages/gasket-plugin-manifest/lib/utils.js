const path = require('path');
const baseConfig = require('./base-config');

/**
 * Merges manifest defaults with gasket.config manifest and passes to
 * every defined `manifest` hook for further manipulation.
 *
 * @param  {Gasket} gasket The gasket API
 * @param {Object} context TODO
 * @returns {Object} manifest.json
 */
async function gatherManifestData(gasket, context) {
  const { logger, execWaterfall, config } = gasket;
  const source = (context.req && context.req.originalUrl) || 'static manifest';

  logger.debug(`Gathering manifest for ${source}`);

  const fromConfig = config.manifest;
  const manifest = { ...baseConfig, ...fromConfig };

  return await execWaterfall('manifest', manifest, context);
}

/**
 * Returns path to static output
 *
 * @param {string|boolean} staticOutput output path from config
 * @param {string} root project root
 * @returns {string} path to static output
 */
function prepareStaticOutputPath(staticOutput, root) {
  // Fixup staticOutput - use default if true
  if (staticOutput === true) {
    staticOutput = 'public/manifest.json';
  }

  if (staticOutput) {
    staticOutput = path.join(root, staticOutput);
  }

  return staticOutput;
}

module.exports = {
  gatherManifestData,
  prepareStaticOutputPath
};
