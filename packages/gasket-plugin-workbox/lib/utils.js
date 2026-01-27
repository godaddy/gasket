import path from 'path';
import merge from 'deepmerge';

const isDefined = o => typeof o !== 'undefined';

/**
 * Workbox defaults
 * @type {object}
 */
const defaultConfig = {
  outputDir: './build/workbox',
  config: {
    skipWaiting: true,
    importScripts: []
  }
};

/**
 * Get the workbox config from gasket.config with defaults
 * @type {import('./index.d.ts').getWorkboxConfig}
 */
function getWorkboxConfig(gasket) {
  const { workbox: workboxConfig = {} } = gasket.config;
  return merge(defaultConfig, workboxConfig);
}

/**
 * Get the build output dir from project root and configured outputDir
 * @type {import('./index.d.ts').getOutputDir}
 */
function getOutputDir(gasket) {
  const { root } = gasket.config;
  const { outputDir } = getWorkboxConfig(gasket);
  return path.join(root, outputDir);
}

/**
 * Get the base path from workbox, or root basePath config.
 * If found in both, the workbox config will be used.
 * @type {import('./index.d.ts').getBasePath}
 */
function getBasePath(gasket) {
  const { workbox, basePath: rootBasePath } = gasket.config;
  const { basePath } = workbox || {};

  return [basePath, rootBasePath, ''].find(isDefined);
}

export {
  defaultConfig,
  getWorkboxConfig,
  getOutputDir,
  getBasePath
};
