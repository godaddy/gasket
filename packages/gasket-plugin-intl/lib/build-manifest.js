/// <reference types="@gasket/plugin-logger" />

import path from 'path';
import fs from 'node:fs/promises';
import { getIntlConfig } from './utils/configure-utils.js';
import { glob } from 'glob';
import debug from 'debug';

const debugLog = debug('gasket:plugin:intl:buildManifest');

/**
 * Constructs a manifest of locale file paths and settings which can be loaded
 * or bundled by the client. Locale paths have content hashes associated with
 * them which can be used for cache busting.
 * @param {import('@gasket/core').Gasket} gasket - Gasket API
 * @param {object} options - Build options
 * @async
 */
export default async function buildManifest(gasket, options = {}) {
  const { logger } = gasket;
  const tgtRoot = options.root || gasket.config.root;
  const { localesDir, managerFilename } = getIntlConfig(gasket);
  const tgtLocalesDir = path.join(tgtRoot, localesDir);

  const tgtFile = path.join(tgtRoot, ...managerFilename.split('/'));
  const {
    defaultLocaleFilePath,
    staticLocaleFilePaths,
    defaultLocale,
    locales,
    localesMap
  } = getIntlConfig(gasket);

  // find all the .json files except the manifest
  debugLog(`Building manifest ${tgtFile} from JSON files in ${localesDir}`);
  const files = (await glob('**/*.json', { cwd: tgtLocalesDir })).filter(
    (f) => f !== managerFilename
  );

  if (!files.length) {
    logger.warn(`build:locales: No locale files found (${localesDir}).`);
  }

  // generate a content hash for each file
  const imports = (
    files.map((file) => {
      const managerDir = path.dirname(path.join(tgtRoot, ...managerFilename.split('/')));
      const relativePath = path.relative(managerDir, tgtLocalesDir) ?? '.';
      let importName = path.join(relativePath, file).replace(/\\/g, '/');
      importName = importName.startsWith('.') ? importName : `./${importName}`;
      const keyName = importName
        .replace(/\.json$/, '')
        .replace(/^[./]+/, '');
      if (gasket.config.intl.experimentalImportAttributes) {
        return { [keyName]: `%() => import('${importName}', { with: { type: 'json' } })%` };
      }

      return { [keyName]: `%() => import('${importName}')%` };
    })
  ).reduce((a, c) => ({ ...a, ...c }), {});

  /**
   * Locale settings and known locale file paths
   */
  const manifest = {
    '%defaultLocaleFilePath%': defaultLocaleFilePath,
    '%staticLocaleFilePaths%': staticLocaleFilePaths,
    '%defaultLocale%': defaultLocale,
    '%locales%': locales,
    '%localesMap%': localesMap,
    '%imports%': imports
  };

  let manifestStr = JSON.stringify(manifest, null, 2);
  manifestStr = manifestStr.replace(/("%|%")/g, '');
  manifestStr = manifestStr.replace(/"/g, `'`);

  const ts = managerFilename.endsWith('.ts');

  const lines = [];
  lines.push('/* -- GENERATED FILE - DO NOT EDIT -- */');
  lines.push(`import { makeIntlManager } from '@gasket/intl';`);
  if (ts) lines.push(`import type { LocaleManifest } from '@gasket/intl';`);
  lines.push('');
  if (ts) lines.push(`const manifest: LocaleManifest = ${manifestStr};`);
  else lines.push(`const manifest = ${manifestStr};`);
  lines.push('');
  lines.push(`export default makeIntlManager(manifest);`);
  lines.push('');

  const content = lines.join('\n');

  const tgtRelative = path.relative(tgtRoot, tgtFile);

  try {
    await fs.writeFile(tgtFile, content, 'utf-8');
    if (options.silent !== true) {
      logger.info(`build:locales: Wrote intl manager ${tgtRelative}.`);
    }
  } catch (err) {
    logger.error(`build:locales: Unable to write intl manager (${tgtRelative}).`);
    throw err;
  }
}
