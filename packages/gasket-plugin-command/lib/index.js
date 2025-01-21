/// <reference types="@gasket/plugin-metadata" />

import create from './create.js';
import configure from './configure.js';
import prepare from './prepare.js';
import commands from './commands.js';
import ready from './ready.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
export default {
  name,
  version,
  description,
  hooks: {
    create,
    configure,
    prepare,
    commands,
    ready,
    metadata(gasket, meta) {
      return {
        ...meta,
        commands: [
          {
            name: 'build',
            description: 'Gasket build command',
            link: 'README.md#build'
          }
        ],
        lifecycles: [
          {
            name: 'commands',
            method: 'exec',
            description: 'Add custom commands to the CLI',
            link: 'README.md#commands',
            parent: 'prepare'
          },
          {
            name: 'build',
            method: 'exec',
            description: 'Gasket build lifecycle',
            link: 'README.md#build',
            parent: 'commands'
          }
        ]
      };
    }
  }
};
