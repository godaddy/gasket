// config options that should not be in manifest output
const excludes = ['staticOutput', 'path'];

/**
 * Merges manifest defaults with gasket.config manifest and passes to
 * every defined `manifest` hook for further manipulation.
 *
 * @param  {Gasket} gasket - The gasket API
 * @param {Object} context - Request context
 * @returns {Object} manifest.json
 */
async function gatherManifestData(gasket, context) {
  const { logger, execWaterfall, config } = gasket;
  const source = (context.req && context.req.originalUrl) || 'static manifest';

  logger.debug(`Gathering manifest for ${source}`);

  // Remove excluded properties in manifest config
  const manifest = Object.keys(config.manifest).reduce((acc, key) => {
    if (!excludes.includes(key)) {
      acc[key] = config.manifest[key];
    }
    return acc;
  }, {});

  return await execWaterfall('manifest', manifest, context);
}

module.exports = {
  gatherManifestData
};
