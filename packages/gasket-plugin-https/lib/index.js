/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-metadata" />
/// <reference types="@gasket/plugin-logger" />

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
const { name, version, description } = pkg;

import * as actions from './actions.js';
import configure from './configure.js';
import metadata from './metadata.js';

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    configure,
    metadata
  }
};

export default plugin;
