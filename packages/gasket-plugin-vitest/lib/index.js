/// <reference types="@gasket/core" />
/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-metadata" />

import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const pkgJson = require('../package.json');
const {
  name,
  version,
  description,
  devDependencies
} = pkgJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    create: {
      timing: {
        last: true,
        before: ['@gasket/plugin-lint']
      },
      handler: async function create(gasket, context) {
        const { files, pkg, apiApp } = context;
        const __dirname = fileURLToPath(import.meta.url);
        const generatorDir = path.join(__dirname, '..', '..', 'generator');
        const isReactProject = pkg.has('dependencies', 'react');

        pkg.add('devDependencies', {
          'vitest': devDependencies.vitest,
          '@vitest/coverage-v8': devDependencies['@vitest/coverage-v8']
        });

        pkg.add('scripts', {
          'test': 'vitest run',
          'test:watch': 'vitest',
          'test:coverage': 'vitest run --coverage'
        });

        if (isReactProject && !apiApp) {
          files.add(
            `${generatorDir}/react/*`,
            `${generatorDir}/react/**/*`
          );

          pkg.add('devDependencies', {
            '@vitejs/plugin-react': devDependencies['@vitejs/plugin-react'],
            '@testing-library/react': devDependencies['@testing-library/react'],
            '@testing-library/dom': devDependencies['@testing-library/dom'],
            'jsdom': devDependencies.jsdom
          });
        } else if (apiApp) {
          files.add(
            `${generatorDir}/api/*`,
            `${generatorDir}/api/**/*`
          );
        }
      }
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        structures: [{
          name: 'test/',
          description: 'Test files'
        }, {
          name: 'vitest.config.js',
          description: 'Vitest configuration file',
          link: 'https://vitest.dev/config/'
        }]
      };
    }
  }
};

export default plugin;
