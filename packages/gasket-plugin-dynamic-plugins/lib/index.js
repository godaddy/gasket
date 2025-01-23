/// <reference types="@gasket/plugin-metadata" />

import prepare from './prepare.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version } = require('../package.json');

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
