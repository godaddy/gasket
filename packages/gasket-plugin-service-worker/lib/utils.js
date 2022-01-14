const uglify = require('uglify-js');

const swHeader = `'use strict';

/* Gasket composed service worker. */

`;

function getSWConfig(gasket) {
  const { config = {} } = gasket;
  const { serviceWorker = {} } = config;
  return serviceWorker;
}

/**
 * Gathers thunks to key caches of composed sw scripts, based on req
 *
 * @param {Gasket} gasket - Gasket
 * @returns {function[]} cacheKeys
 * @async
 */
async function getCacheKeys(gasket) {
  const { exec } = gasket;
  const { cacheKeys: userCacheKeys = [] } = getSWConfig(gasket);

  const pluginCacheKeys = await exec('serviceWorkerCacheKey');

  return [...userCacheKeys, ...pluginCacheKeys]
    .filter(k => typeof k === 'function');
}

async function getComposedContent(gasket, context) {
  const { execWaterfall, config: { env } } = gasket;
  const swConfig = getSWConfig(gasket);
  const { content, minify = {} } = swConfig;
  const composed = await execWaterfall('composeServiceWorker', content, context);
  const minifyConfig = minify === true ? {} : minify;

  let composedContent = swHeader + composed;
  // if the consuming application has specified minification or
  // is in a production in environment, minify the service worker script.
  if ('minify' in swConfig || /prod/i.test(env)) {
    composedContent = uglify.minify(composedContent, minifyConfig).code;
  }

  return composedContent;
}

let __script;

/**
 * Loads template file once with substitutions from config
 *
 * @param {Object} config - ServiceWorker config from gasket.config
 * @returns {Promise<string>} template
 */
async function loadRegisterScript(config) {
  if (!__script) {
    const { readFile } = require('fs/promises');

    const { url, scope } = config;
    const template = require.resolve('./sw-register.template.js');

    // eslint-disable-next-line require-atomic-updates
    __script = (await readFile(template, 'utf8'))
      .replace('{URL}', url)
      .replace('{SCOPE}', scope);
  }
  return __script;
}

module.exports = {
  getSWConfig,
  getCacheKeys,
  getComposedContent,
  loadRegisterScript
};
