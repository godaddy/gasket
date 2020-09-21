const urljoin = require('url-join');
const { createGetLocale, getAssetPrefix } = require('./utils');

const reModulePath = /(.*_locales\/)(.*)(\/.*)/;

/**
 * Encode the identifier part of the locale file uri
 * This is necessary to match request for these assets by `@gasket/intl`
 *
 * @param {Object} originalManifest - Workbox manifest
 * @returns {Object} results - Transformed manifest
 */
const encodeLocaleUrls = originalManifest => {
  const manifest = originalManifest.reduce((acc, entry) => {
    const { url } = entry;
    if (url.includes('_locales/')) {
      const [, root, module, file] = reModulePath.exec(url);
      entry.url = [root, encodeURIComponent(module), file].join('');
    }
    acc.push(entry);
    return acc;
  }, []);
  return { manifest };
};

/**
 * Workbox config partial to add next.js static assets to precache
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} config - Initial workbox config
 * @param {Request} req - Request
 * @returns {Promise<Object>} config
 */
module.exports = async function workbox(gasket, config, req) {
  const language = createGetLocale(gasket)(req);
  const assetPrefix = getAssetPrefix(gasket);

  return {
    globDirectory: '.',
    globPatterns: [
      `build/locales/**/*.${language}.json`
    ],
    modifyURLPrefix: {
      'build/locales/': urljoin(assetPrefix, '_locales/')
    },
    manifestTransforms: [
      encodeLocaleUrls
    ]
  };
};


module.exports.encodeLocaleUrls = encodeLocaleUrls;
