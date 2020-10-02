const path = require('path');
const fs = require('fs');
const { getIntlConfig } = require('./utils');
const { promisify } = require('util');
const loaderUtils = require('loader-utils');

const glob = promisify(require('glob'));
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

module.exports = async function buildManifest(gasket) {
  const { logger } = gasket;
  const { basePath, defaultPath, defaultLocale, localesMap, localesDir, manifestFilename } = getIntlConfig(gasket);
  const tgtFile = path.join(localesDir, manifestFilename);

  const files = (await glob('**/*.json', { cwd: localesDir }))
    .filter(f => f !== manifestFilename);

  const paths = (
    await Promise.all(files.map(async f => {
      const buffer = await readFile(path.join(localesDir, f));
      const hash = loaderUtils.getHashDigest(buffer, 'md5', 'hex', 7);
      return { [f]: hash };
    })))
    .reduce((a, c) => ({ ...a, ...c }), {});

  const manifest = {
    basePath,
    defaultPath,
    defaultLocale,
    localesMap,
    paths
  };

  await writeFile(tgtFile, JSON.stringify(manifest), 'utf-8');
  logger.log(`build:locales: Wrote locales manifest.`);
};
