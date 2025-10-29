import defaultsDeep from 'lodash.defaultsdeep';
import { DEFAULT_CONFIG } from './utils/constants.js';

/**
 * Configure lifecycle to set up SW config with defaults
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
export default function configure(gasket, baseConfig) {
  const userConfig = baseConfig?.docs || {};

  const docs = defaultsDeep({}, userConfig, DEFAULT_CONFIG);
  return { ...baseConfig, docs };
}
