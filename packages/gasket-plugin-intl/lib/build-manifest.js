const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util');
const loaderUtils = require('loader-utils');
const { getIntlConfig } = require('./configure');

// TODO: Need to review for native promise usage
const glob = promisify(require('glob'));

const debug = require('debug')('gasket:plugin:intl:buildManifest');

/**
 * Constructs a manifest of locale file paths and settings which can be loaded
 * or bundled by the client. Locale paths have content hashes associated with
 * them which can be used for cache busting.
 *
 * @param {Gasket} gasket - Gasket API
 * @async
 */
module.exports = async function buildManifest(gasket) {
  const { logger } = gasket;
  const { localesDir, manifestFilename } = getIntlConfig(gasket);
  const tgtFile = path.join(localesDir, manifestFilename);
  const { basePath, defaultPath, defaultLocale, locales, localesMap } =
    getIntlConfig(gasket);

  // find all the .json files except the manifest
  debug(`Building manifest ${tgtFile} from JSON files in ${localesDir}`);
  const files = (await glob('**/*.json', { cwd: localesDir })).filter(
    (f) => f !== manifestFilename
  );

  if (!files.length) {
    logger.warning(`build:locales: No locale files found (${localesDir}).`);
  }

  // generate a content hash for each file
  const paths = (
    await Promise.all(
      files.map(async (file) => {
        const buffer = await fs.readFile(path.join(localesDir, file));
        const hash = loaderUtils.getHashDigest(buffer, 'md5', 'hex', 7);
        return { [path.basename(localesDir) + '/' + file]: hash };
      })
    )
  ).reduce((a, c) => ({ ...a, ...c }), {});

  /**
   * Locale settings and known locale file paths
   *
   * @type {LocaleManifest}
   */
  const manifest = {
    basePath,
    defaultPath,
    defaultLocale,
    locales,
    localesMap,
    paths
  };

  try {
    await fs.writeFile(tgtFile, JSON.stringify(manifest), 'utf-8');
    logger.info('build:locales: Wrote locales manifest.');
  } catch (err) {
    logger.error('build:locales: Unable to write locales manifest.');
    throw err;
  }
};
