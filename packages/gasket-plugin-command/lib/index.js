/// <reference types="@gasket/plugin-metadata" />

import configure from './configure.js';
import prepare from './prepare.js';
import commands from './commands.js';
import ready from './ready.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
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

export default plugin;
