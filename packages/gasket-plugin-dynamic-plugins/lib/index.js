/// <reference types="@gasket/plugin-metadata" />

import create from './create.js';
import prepare from './prepare.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version } = packageJson;

/** @type {import('@gasket/core').Plugin} */
export default {
  name,
  version,
  hooks: {
    create,
    prepare,
    metadata(gasket, meta) {
      return {
        ...meta,
        configurations: [
          {
            name: 'dynamicPlugins',
            link: 'README.md#configuration',
            description: 'Specify which plugins to load dynamically into gasket',
            type: 'array'
          }
        ]
      };
    }
  }
};
