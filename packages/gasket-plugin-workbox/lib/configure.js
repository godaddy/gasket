/// <reference types="@gasket/plugin-command" />

const {
  getWorkboxConfig,
  getBasePath
} = require('./utils');

/**
 * Configure lifecycle to set up SW config with defaults
 * @type {import('@gasket/engine').HookHandler<'configure'>}
 */
module.exports = async function configure(gasket, config) {
  const { logger } = gasket;
  const workbox = getWorkboxConfig({ config });
  const basePath = getBasePath({ config });

  if ('assetPrefix' in workbox) logger.warning('DEPRECATED workbox config `assetPrefix` - use `basePath`');
  workbox.basePath = basePath;

  const { version } = require('workbox-build/package.json');
  const libraryVersion = `workbox-v${version}`;

  const scriptUrl = [
    ...(basePath ? [basePath] : []),
    '_workbox',
    libraryVersion,
    'workbox-sw.js'
  ].join('/');

  const { importScripts } = workbox.config;

  workbox.libraryVersion = libraryVersion;
  workbox.config.importScripts = [scriptUrl, ...importScripts];

  return ({ ...config, workbox });
};
