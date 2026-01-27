/// <reference types="@gasket/plugin-command" />
/// <reference types="@gasket/plugin-logger" />

import path from 'path';
import { writeFile } from 'fs/promises';
import mkdirp from 'mkdirp';
import { getComposedContent, getSWConfig } from './utils/utils.js';

/**
 * Write a static service worker file
 * @type {import('@gasket/core').HookHandler<'build'>}
 */
async function handler(gasket) {
  const {
    logger,
    config: { root }
  } = gasket;
  const { staticOutput } = getSWConfig(gasket);

  if (staticOutput && typeof staticOutput === 'string') {
    const composedContent = await getComposedContent(gasket, {});

    await mkdirp(path.dirname(staticOutput));
    await writeFile(staticOutput, composedContent, 'utf-8');
    logger.info(
      `build:service-worker: Wrote service worker file (${path.relative(
        root,
        staticOutput
      )}).`
    );
  }

  return;
}

export default {
  timing: {
    last: true
  },
  handler
};
