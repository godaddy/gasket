/// <reference types="@gasket/core" />

import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

import configure from './configure.js';
import { actions } from './actions.js';
import initReduxState from './init-redux-state.js';
import metadata from './metadata.js';

/**
 * @type {import('@gasket/core').Plugin}
 */
export default {
  name,
  version,
  description,
  actions,
  hooks: {
    configure,
    initReduxState,
    metadata
  }
};
