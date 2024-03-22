/// <reference types="@gasket/plugin-start" />
/// <reference types="@gasket/plugin-log" />

const path = require('path');
const { writeFile } = require('fs').promises;
const mkdirp = require('mkdirp');
const { getComposedContent, getSWConfig } = require('./utils');

/**
 * Write a static service worker file
 * @type {import('@gasket/engine').HookHandler<'build'>}
 */
async function handler(gasket) {
  const { logger, config: { root } } = gasket;
  const { staticOutput } = getSWConfig(gasket);
  if (!staticOutput) return;

  const composedContent = await getComposedContent(gasket, {});

  await mkdirp(path.dirname(staticOutput));
  await writeFile(staticOutput, composedContent, 'utf-8');
  logger.log(`build:service-worker: Wrote service worker file (${path.relative(root, staticOutput)}).`);
}

/**
 * Build lifecycle to write a static service worker file
 */
module.exports = {
  timing: {
    last: true
  },
  handler
};
