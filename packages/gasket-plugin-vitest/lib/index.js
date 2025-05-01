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
          vitest: devDependencies.vitest,
          '@vitest/coverage-v8': devDependencies['@vitest/coverage-v8'],
          '@vitest/ui': devDependencies['@vitest/ui']
        });

        if (isReactProject && !apiApp) {
          files.add(
            `${generatorDir}/*`,
            `${generatorDir}/**/*`
          );

          pkg.add('devDependencies', {
            '@testing-library/react': devDependencies['@testing-library/react'],
            '@testing-library/jest-dom': devDependencies['@testing-library/jest-dom'],
            '@testing-library/user-event': devDependencies['@testing-library/user-event'],
            '@testing-library/dom': devDependencies['@testing-library/dom']
          });

          pkg.add('scripts', {
            test: 'vitest run',
            'test:watch': 'vitest',
            'test:coverage': 'vitest run --coverage'
          });
        } else if (apiApp) {
          if (typescript) {
            pkg.add('devDependencies', {
              '@types/vitest': devDependencies['@types/vitest'],
              'ts-jest': devDependencies['ts-jest'],
              'ts-node': devDependencies['ts-node']
            });

            pkg.add('scripts', {
              test: 'vitest run',
              'test:watch': 'vitest',
              'test:coverage': 'vitest run --coverage'
            });
          }
        }
      }
    }
  }
};