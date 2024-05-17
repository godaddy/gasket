import configure from './configure.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
export default {
  name,
  hooks: {
    configure,
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
