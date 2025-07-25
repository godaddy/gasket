const { transformSync } = require('@swc/core');

const swHeader = `'use strict';

/* Gasket composed service worker. */

`;

/**
 * minify the service worker content
 * @type {import('../index').minifyContent}
 */
function minifyContent(code, options = {}) {
  const result = transformSync(code, {
    minify: true,
    jsc: {
      minify: {
        compress: true,
        mangle: true,
        ...options
      }
    }
  });

  return result.code;
}

/**
 * Get the service worker configuration from the gasket config
 * @type {import('../index').getSWConfig}
 */
function getSWConfig(gasketPartial) {
  const { serviceWorker = {} } = gasketPartial?.config || {};
  return serviceWorker;
}

/**
 * Gathers thunks to key caches of composed sw scripts, based on req
 * @type {import('../index').getCacheKeys}
 */
async function getCacheKeys(gasket) {
  const { exec } = gasket;
  const { cacheKeys: userCacheKeys = [] } = getSWConfig(gasket);
  const pluginCacheKeys = await exec('serviceWorkerCacheKey');

  return [...userCacheKeys, ...pluginCacheKeys].filter(
    (key) => typeof key === 'function'
  );
}

/**
 * Composes the service worker content from the configured content
 * @type {import('../index').getComposedContent}
 */
async function getComposedContent(gasket, context) {
  const {
    execWaterfall,
    config: { env }
  } = gasket;
  const swConfig = getSWConfig(gasket);
  const { content, minify = {} } = swConfig;

  /** @type {string} */
  const composed = await execWaterfall(
    'composeServiceWorker',
    content,
    context
  );
  const minifyConfig = minify === true ? {} : minify;

  let composedContent = swHeader + composed;
  // if the consuming application has specified minification or
  // is in a production in environment, minify the service worker script.
  if (
    ('minify' in swConfig || /prod/i.test(env)) &&
    typeof minifyConfig === 'object'
  ) {
    composedContent = minifyContent(composedContent, minifyConfig);
  }

  return composedContent;
}

let __script;

/**
 * Loads template file once with substitutions from config
 * @type {import('../index').loadRegisterScript}
 */
async function loadRegisterScript(config) {
  if (!__script) {
    const fs = require('fs').promises;
    const { url, scope } = config;
    const template = require.resolve('./sw-register.template.js');

    __script = (await fs.readFile(template, 'utf8'))
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
