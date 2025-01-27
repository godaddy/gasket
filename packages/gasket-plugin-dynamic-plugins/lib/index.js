/// <reference types="@gasket/plugin-metadata" />

import prepare from './prepare.js';
import pkg from '../package.json' with { type: 'json' };
const { name, version } = pkg;

/** @type {import('@gasket/core').Plugin} */
export default {
  name,
  version,
  hooks: {
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
