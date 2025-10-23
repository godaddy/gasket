/// <reference types="@gasket/plugin-workbox" />

import url from 'url';
import path from 'path';
const isDefined = (o) => typeof o !== 'undefined';

/**
 * Workbox config partial to add Next.js static assets to precache
 * @type {import('@gasket/core').HookHandler<'workbox'>}
 */
export default function workbox(gasket) {
  const { nextConfig = {}, basePath: rootBasePath } = gasket.config;
  const assetPrefix = [
    nextConfig.assetPrefix,
    nextConfig.basePath,
    rootBasePath,
    ''
  ].find(isDefined);

  const parsed = assetPrefix ? url.parse(assetPrefix) : '';

  const joined = parsed
    ? url.format({
      ...parsed,
      pathname: path.join(parsed.pathname, '_next/')
    })
    : '_next/';

  return {
    globDirectory: '.',
    globPatterns: ['.next/static/**'],
    modifyURLPrefix: {
      '.next/': joined
    }
  };
}
