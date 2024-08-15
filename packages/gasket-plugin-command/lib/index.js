import create from './create.js';
import configure from './configure.js';
import commands from './commands.js';

const { default: pkg } = await import('../package.json', { assert: { type: 'json' } });
const { name, version, description } = pkg;

/** @type {import('@gasket/core').Plugin} */
export default {
  name,
  version,
  description,
  hooks: {
    create,
    configure,
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
            parent: 'configure'
          }
        ]
      };
    }
  }
};
