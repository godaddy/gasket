/// <reference types="@gasket/core" />
/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-metadata" />

import {
  name,
  version,
  description,
  devDependencies } from '../package.json';

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
        const { files, pkg, typescript, apiApp } = context;
        const generatorDir = `${__dirname}/../generator`;
        const isReactProject = pkg.has('dependencies', 'react');

        pkg.add('devDependencies', {
          vitest: devDependencies.vitest
        });

        pkg.add('scripts', {
          test: 'vitest run',
          'test:watch': 'vitest',
          'test:coverage': 'vitest run --coverage'
        });

        if (isReactProject && !apiApp) {
          files.add(
            `${generatorDir}/*`,
            `${generatorDir}/**/*`
          );

          if (typescript) {
            pkg.add('devDependencies', {
              'vite-tsconfig-paths': devDependencies['vite-tsconfig-paths']
            });
          }

          pkg.add('devDependencies', {
            '@vitejs/plugin-react': devDependencies['@vitejs/plugin-react'],
            '@testing-library/react': devDependencies['@testing-library/react'],
            '@testing-library/dom': devDependencies['@testing-library/dom'],
            'jsdom': devDependencies.jsdom
          });
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
      }
    }
  }
};

export default plugin;