const path = require('path');
const fs = require('fs');
const { getIntlConfig } = require('./configure');
const { promisify } = require('util');
const loaderUtils = require('loader-utils');

const glob = promisify(require('glob'));
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

module.exports = async function buildManifest(gasket) {
  const { logger } = gasket;
  const { localesDir, manifestFilename } = getIntlConfig(gasket);
  const tgtFile = path.join(localesDir, manifestFilename);

  const files = (await glob('**/*.json', { cwd: localesDir }))
    .filter(f => f !== manifestFilename);

  const paths = (
    await Promise.all(files.map(async file => {
      const buffer = await readFile(path.join(localesDir, file));
      const hash = loaderUtils.getHashDigest(buffer, 'md5', 'hex', 7);
      return { [file]: hash };
    })))
    .reduce((a, c) => ({ ...a, ...c }), {});

  const { basePath, localesPath, defaultLocale, localesMap } = getIntlConfig(gasket);

  const manifest = {
    basePath,
    localesPath,
    defaultLocale,
    localesMap,
    paths
  };

  await writeFile(tgtFile, JSON.stringify(manifest), 'utf-8');
  logger.log(`build:locales: Wrote locales manifest.`);
};
