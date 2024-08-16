import create from './create.js';
import ready from './ready.js';
import commands from './commands.js';
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
    ready,
    commands,
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [
          {
            name: 'commands',
            method: 'execSync',
            description: 'Add custom commands to the CLI',
            link: 'README.md#commands',
            parent: 'ready'
          }
        ]
      };
    }
  }
};
