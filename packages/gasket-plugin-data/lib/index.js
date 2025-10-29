/// <reference types="@gasket/core" />

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

import create from './create.js';
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
    create,
    configure,
    initReduxState,
    metadata
  }
};
