/// <reference types="@gasket/core" />

import merge from 'deepmerge';
import path from 'path';
import baseConfig from './base-config.js';

/**
 * Configure lifecycle to set up manifest with defaults
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
export default function configure(gasket, config) {
  const { config: { root } } = gasket;
  const manifest = merge(baseConfig, config.manifest || {});

  let { staticOutput } = manifest;

  // Fixup staticOutput - use default if true
  if (staticOutput === true) {
    staticOutput = 'public/manifest.json';
  }

  if (staticOutput) {
    staticOutput = path.join(root, staticOutput);
    manifest.staticOutput = staticOutput;
  }

  return { ...config, manifest };
}
