
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
  const fromConfig = {};

  logger.debug(`Gathering manifest for ${source}`);

  // Do not include staticOutput in manifest
  for (const prop in config.manifest) {
    if (prop !== 'staticOutput') {
      fromConfig[prop] = config.manifest[prop];
    }
  }

  const manifest = { ...baseConfig, ...fromConfig };

  return await execWaterfall('manifest', manifest, context);
}

module.exports = {
  gatherManifestData
};
