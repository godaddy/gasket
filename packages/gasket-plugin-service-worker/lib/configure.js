/// <reference types="@gasket/core" />

const path = require('path');
const merge = require('deepmerge');
const { getSWConfig } = require('./utils/utils');

/**
 * Service worker defaults
 *
 * Cache is configured to keep content for 5 days since last request.
 * This is to keep the cache from growing out of hand without limiting the
 * number of items. We won't know the number of cache keys, but we do know
 * that plugins could change their key element based on services they may
 * tie into, so we will instead dispose stale content.
 */
const defaultConfig = {
  url: '/sw.js',
  scope: '/',
  content: '',
  cache: {
    maxAge: 1000 * 60 * 60 * 24 * 5, // 5 days
    updateAgeOnGet: true
  }
};

/**
 * Configure lifecycle to set up SW config with defaults
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
module.exports = function configure(gasket, config) {
  const serviceWorker = merge(defaultConfig, getSWConfig({ config }));
  let { staticOutput } = serviceWorker;

  // Fixup staticOutput - use default if true
  if (staticOutput === true) {
    staticOutput = 'public/sw.js';
  }
  if (staticOutput) {
    staticOutput = path.join(gasket.config.root, staticOutput);
  }

  serviceWorker.staticOutput = staticOutput;

  return { ...config, serviceWorker };
};
