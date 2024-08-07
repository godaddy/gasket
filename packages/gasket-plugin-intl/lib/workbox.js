/// <reference types="@gasket/plugin-workbox" />

const path = require('path');
const urljoin = require('url-join');
const { getIntlConfig } = require('./configure');

/**
 * Create a function to encode the locale urls
 * @param {string} localesPath - path to the locale files
 * @returns {function(*): {manifest: *}} encodeLocaleUrls
 */
function makeEncodeLocaleUrls(localesPath) {
  const reModulePath = new RegExp(`(.*${localesPath}/)(.*)(/.*)`);
  /**
   * Encode the identifier part of the locale file uri
   * This is necessary to match request for these assets by `@gasket/react-intl`
   * @param {object} originalManifest - Workbox manifest
   * @returns {object} results - Transformed manifest
   */
  return function encodeLocaleUrls(originalManifest) {
    const manifest = originalManifest.reduce((acc, entry) => {
      const { url } = entry;
      if (reModulePath.test(url)) {
        const [, root, module, file] = reModulePath.exec(url);
        entry.url = [root, encodeURIComponent(module), file].join('');
      }
      acc.push(entry);
      return acc;
    }, []);
    return { manifest };
  };
}

/**
 * Workbox config partial to add locale files to precache for request-based
 * service workers.
 * @type {import('@gasket/engine').HookHandler<'workbox'>}
 */
module.exports = async function workbox(gasket, config, context) {
  const { root } = gasket.config;
  const { basePath = '', defaultPath, localesDir } = getIntlConfig(gasket);
  const { res } = context;

  // since we cannot determine a users' locale at build time, exit early
  if (
    !res ||
    !res.locals ||
    !res.locals.gasketData ||
    !res.locals.gasketData.intl
  )
    return {};

  const { locale } = res.locals.gasketData.intl;

  // Get the relative dir glob path
  const relGlobDir = path.relative(root, localesDir).replace(/\\/g, '/');
  const encodeLocaleUrls = makeEncodeLocaleUrls(defaultPath);

  return {
    globDirectory: '.',
    globPatterns: [
      `${relGlobDir}/**/${locale}.json`,
      `${relGlobDir}/**/${locale}/*.json`
    ],
    modifyURLPrefix: {
      [relGlobDir]: urljoin(basePath.replace(/\/$/, ''), defaultPath)
    },
    manifestTransforms: [encodeLocaleUrls]
  };
};

// @ts-ignore
module.exports.makeEncodeLocaleUrls = makeEncodeLocaleUrls;
