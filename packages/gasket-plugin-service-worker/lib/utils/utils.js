import { transformSync } from '@swc/core';

const swHeader = `'use strict';

/* Gasket composed service worker. */

`;

/**
 * minify the service worker content
 * @type {import('../index.d.ts').minifyContent}
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
 * @type {import('../index.d.ts').getSWConfig}
 */
function getSWConfig(gasketPartial) {
  const { serviceWorker = {} } = gasketPartial?.config || {};
  return serviceWorker;
}

/**
 * Gathers thunks to key caches of composed sw scripts, based on req
 * @type {import('../index.d.ts').getCacheKeys}
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
 * @type {import('../index.d.ts').getComposedContent}
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
 * @type {import('../index.d.ts').loadRegisterScript}
 */
async function loadRegisterScript(config) {
  if (!__script) {
    const { readFile } = await import('fs/promises');
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const { url, scope } = config;
    const template = require.resolve('./sw-register.template.js');

    __script = (await readFile(template, 'utf8'))
      .replace('{URL}', url)
      .replace('{SCOPE}', scope);
  }
  return __script;
}

export {
  getSWConfig,
  getCacheKeys,
  getComposedContent,
  loadRegisterScript
};
