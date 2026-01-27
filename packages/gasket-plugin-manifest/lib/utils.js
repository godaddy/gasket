// config options that should not be in manifest output
const excludes = ['staticOutput', 'path'];

/**
 * Merges manifest defaults with gasket.config manifest and passes to
 * every defined `manifest` hook for further manipulation.
 * @type {import('./internal.d.ts').gatherManifestData}
 */
export async function gatherManifestData(gasket, context) {
  const { logger, execWaterfall, config } = gasket;
  const source = (context.req && context.req.originalUrl) || 'static manifest';

  logger.debug(`Gathering manifest for ${source}`);

  /**
   * Remove excluded properties in manifest config
   * @type {Partial<import('./index.d.ts').Manifest>}
   */
  const manifest = Object.keys(config.manifest).reduce((acc, key) => {
    if (!excludes.includes(key)) {
      acc[key] = config.manifest[key];
    }
    return acc;
  }, {});

  return await execWaterfall('manifest', manifest, context);
}
