/// <reference types="@gasket/plugin-logger" />

const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util');
const { getIntlConfig } = require('./configure');

// TODO: Need to review for native promise usage
const glob = promisify(require('glob'));

const debug = require('debug')('gasket:plugin:intl:buildManifest');

/**
 * Constructs a manifest of locale file paths and settings which can be loaded
 * or bundled by the client. Locale paths have content hashes associated with
 * them which can be used for cache busting.
 * @param {import("@gasket/core").Gasket} gasket - Gasket API
 * @async
 */
module.exports = async function buildManifest(gasket) {
  const { logger } = gasket;
  const { localesDir, managerFilename } = getIntlConfig(gasket);
  const tgtFile = path.join(localesDir, managerFilename);
  const {
    defaultLocaleFilePath,
    defaultLocale,
    locales,
    localesMap
  } = getIntlConfig(gasket);

  // find all the .json files except the manifest
  debug(`Building manifest ${tgtFile} from JSON files in ${localesDir}`);
  const files = (await glob('**/*.json', { cwd: localesDir })).filter(
    (f) => f !== managerFilename
  );

  if (!files.length) {
    logger.warn(`build:locales: No locale files found (${localesDir}).`);
  }

  // generate a content hash for each file
  const imports = (
    files.map((file) => {
      const importName = ['.', path.basename(localesDir), file].join('/');
      const keyName = importName
        .replace(/\.json$/, '')
        .replace('./', '');
      return { [keyName]: `%() => import('${importName}').then(m => m.default)%` };
    })
  ).reduce((a, c) => ({ ...a, ...c }), {});

  /**
   * Locale settings and known locale file paths
   */
  const manifest = {
    '%defaultLocaleFilePath%': defaultLocaleFilePath,
    '%defaultLocale%': defaultLocale,
    '%locales%': locales,
    '%localesMap%': localesMap,
    '%imports%': imports
  };

  let manifestStr = JSON.stringify(manifest, null, 2);
  manifestStr = manifestStr.replace(/("%|%")/g, '');
  manifestStr = manifestStr.replace(/"/g, `'`);

  const content = `/* -- GENERATED FILE - DO NOT EDIT -- */
import { makeIntlManager } from '@gasket/helper-intl';

const manifest = ${manifestStr};

export default makeIntlManager(manifest);
`;

  try {
    await fs.writeFile(tgtFile, content, 'utf-8');
    logger.info('build:locales: Wrote locales manifest.');
  } catch (err) {
    logger.error('build:locales: Unable to write locales manifest.');
    throw err;
  }
};
