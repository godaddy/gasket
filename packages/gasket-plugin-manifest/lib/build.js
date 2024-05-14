/// <reference types="@gasket/plugin-start" />
/// <reference types="@gasket/plugin-log" />

const path = require('path');
const { writeFile } = require('fs').promises;
const mkdirp = require('mkdirp');
const { gatherManifestData } = require('./utils');

/**
 * Write a static web manifest file
 * @type {import('@gasket/engine').HookHandler<'build'>}
 */
module.exports = async function build(gasket) {
  const {
    logger,
    config: { root, manifest }
  } = gasket;

  if (manifest && typeof manifest.staticOutput === 'string') {
    const gatheredManifest = await gatherManifestData(gasket, {});

    await mkdirp(manifest.staticOutput.toString().replace('manifest.json', ''));

    await writeFile(
      manifest.staticOutput,
      JSON.stringify(gatheredManifest),
      'utf-8'
    );

    logger.log(
      `build:web-manifest: Wrote web manifest file (${path.relative(
        root,
        manifest.staticOutput
      )}).`
    );
  }
};
