/// <reference types="@gasket/plugin-service-worker" />
/// <reference types="@gasket/plugin-logger" />

import { generateSWString } from 'workbox-build';
import merge from 'deepmerge';

const reComments = /\/\*.*(\n.+)*\*\//g;

/**
 * Gathers Workbox config by executing the `workbox` lifecycle.
 * Generates service worker strings and appends to the service worker content.
 * @type {import('@gasket/core').HookHandler<'composeServiceWorker'>}
 */
export default async function composeServiceWorker(gasket, content, context) {
  const { exec, config, logger } = gasket;
  const { workbox } = config;

  const configs = (await exec('workbox', workbox.config, context)).filter(
    Boolean
  );
  const mergedConfig = merge.all([workbox.config, ...configs]);

  const build = await generateSWString(mergedConfig);
  //
  // strip comments from workbox script
  //
  const workboxContent = build.swString.replace(reComments, '');

  if (build.warnings && build.warnings.length) {
    logger.warn(build.warnings);
  }

  return content + workboxContent;
}
