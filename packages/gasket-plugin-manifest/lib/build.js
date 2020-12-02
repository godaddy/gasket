const path = require('path');
const { promisify } = require('util');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { gatherManifestData } = require('./utils');

const writeFile = promisify(fs.writeFile);

/**
 * Write a static web manifest file
 *
 * @param {Gasket} gasket - Gasket
 * @async
 */
async function build(gasket) {
  const { logger, config: { root, manifest } } = gasket;
  if (!manifest || !manifest.staticOutput) return;

  const gatheredManifest = await gatherManifestData(gasket, {});
  let manifestPath = '/public/manifest.json';

  if (manifest.staticOutput !== true) {
    manifestPath = manifest.staticOutput;
  }

  await mkdirp(manifestPath);

  await writeFile(manifestPath, JSON.stringify(gatheredManifest), 'utf-8');

  logger.log(`build:web-manifest: Wrote web manifest file (${path.relative(root, manifestPath)}).`);
}

/**
 * Build lifecycle to write a static web manifest file
 *
 * @param {Gasket} gasket - Gasket
 */
module.exports = build;
