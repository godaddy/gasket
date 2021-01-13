const path = require('path');
const urljoin = require('url-join');
const { getIntlConfig } = require('./configure');


function makeEncodeLocaleUrls(localesPath) {
  const reModulePath = new RegExp(`(.*${ localesPath }/)(.*)(/.*)`);
  /**
   * Encode the identifier part of the locale file uri
   * This is necessary to match request for these assets by `@gasket/react-intl`
   *
   * @param {Object} originalManifest - Workbox manifest
   * @returns {Object} results - Transformed manifest
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
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} config - Initial workbox config
 * @param {Object} context - Service worker context
 * @param {Response} context.res - Response
 * @returns {Promise<Object>} config
 */
module.exports = async function workbox(gasket, config, context) {
  const { root } = gasket.config;
  const { basePath = '' } = getIntlConfig(gasket);
  const { localesPath, localesDir } = getIntlConfig(gasket);
  const { res } = context;

  // since we cannot determine a users' locale at build time, exit early
  if (!res) return {};

  const { locale } = res.locals.gasketData.intl;

  // Get the relative dir glob path
  const relGlobDir = path.relative(root, localesDir).replace(/\\/g, '/');
  const encodeLocaleUrls = makeEncodeLocaleUrls(localesPath);

  return {
    globDirectory: '.',
    globPatterns: [
      `${ relGlobDir }/**/${ locale }.json`,
      `${ relGlobDir }/**/${ locale }/*.json`
    ],
    modifyURLPrefix: {
      [relGlobDir]: urljoin(basePath.replace(/\/$/, ''), localesPath)
    },
    manifestTransforms: [
      encodeLocaleUrls
    ]
  };
};

module.exports.makeEncodeLocaleUrls = makeEncodeLocaleUrls;
