/// <reference types="@gasket/plugin-metadata" />

import create from './create.js';
import prepare from './prepare.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkgJson = require('../package.json');
const { name, version } = pkgJson;

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
