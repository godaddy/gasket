/**
 * Gathers thunks to key caches of composed sw scripts, based on req
 *
 * @param {Gasket} gasket - Gasket
 * @returns {function[]} cacheKeys
 * @async
 */
async function getCacheKeys(gasket) {
  const { exec, config } = gasket;
  const {
    cacheKeys: userCacheKeys = []
  } = config.serviceWorker || {};

  const pluginCacheKeys = await exec('serviceWorkerCacheKey');

  return [...userCacheKeys, ...pluginCacheKeys]
    .filter(k => typeof k === 'function');
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
    const util = require('util');
    const fs = require('fs');
    const readFile = util.promisify(fs.readFile);

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
  getCacheKeys,
  loadRegisterScript
};
