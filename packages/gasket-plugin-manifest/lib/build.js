/// <reference types="@gasket/plugin-command" />
/// <reference types="@gasket/plugin-logger" />

const path = require('path');
const { writeFile } = require('fs').promises;
const mkdirp = require('mkdirp');
const { gatherManifestData } = require('./utils');

/**
 * Write a static web manifest file
 * @type {import('@gasket/core').HookHandler<'build'>}
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

    logger.info(
      `build:web-manifest: Wrote web manifest file (${path.relative(
        root,
        manifest.staticOutput

      )}).`
    );
  }
};
