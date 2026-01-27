import {
  getWorkboxConfig,
  getBasePath
} from './utils.js';
import packageJson from 'workbox-build/package.json' with { type: 'json' };

/** @type {import('@gasket/core').HookHandler<'configure'>} */
export default function configure(gasket, config) {
  const workbox = getWorkboxConfig({ config });
  const basePath = getBasePath({ config });

  gasket.logger.warn(
    `DEPRECATED \`@gasket/plugin-workbox\` will not be support in future major release.`
  );

  workbox.basePath = basePath;

  const { version } = packageJson;
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
}
