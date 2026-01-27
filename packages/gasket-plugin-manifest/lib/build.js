/// <reference types="@gasket/plugin-command" />
/// <reference types="@gasket/plugin-logger" />

import path from 'path';
import { writeFile } from 'fs/promises';
import mkdirp from 'mkdirp';
import { gatherManifestData } from './utils.js';

/**
 * Write a static web manifest file
 * @type {import('@gasket/core').HookHandler<'build'>}
 */
export default async function build(gasket) {
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
}
