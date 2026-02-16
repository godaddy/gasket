/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-metadata" />
/// <reference types="@gasket/plugin-logger" />
/// <reference types="create-gasket-app" />

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

const pkg = JSON.parse(readFileSync(join(dirName, '../package.json'), 'utf8'));
const { name, version, description } = pkg;

import * as actions from './actions.js';
import createHook from './create.js';
import configure from './configure.js';
import metadata from './metadata.js';

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    create: createHook,
    configure,
    metadata
  }
};

export default plugin;
