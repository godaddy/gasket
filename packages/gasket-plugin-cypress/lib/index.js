/// <reference types="@gasket/cli" />
/// <reference types="@gasket/plugin-metadata" />

const { devDependencies, name } = require('../package.json');

/** @type {import('@gasket/engine').Plugin} */
const plugin = {
  name,
  hooks: {
    create: {
      timing: {
        after: ['@gasket/plugin-nextjs']
      },
      handler: async function create(gasket, { files, pkg }) {
        const generatorDir = `${__dirname}/../generator`;
        const isReactProject = pkg.has('dependencies', 'react');

        pkg.add('devDependencies', {
          cypress: devDependencies.cypress
        });

        if (isReactProject) {
          files.add(`${generatorDir}/*`, `${generatorDir}/**/*`);

          pkg.add('devDependencies', {
            'start-server-and-test': devDependencies['start-server-and-test']
          });
        }

        pkg.add('scripts', {
          'start:local': 'gasket start --env local',
          'cypress': 'cypress open',
          'cypress:headless': 'cypress run',
          'e2e': 'start-server-and-test start:local http://localhost:8080 cypress',
          'e2e:headless':
            'start-server-and-test start:local http://localhost:8080 cypress:headless'
        });
      }
    },
    metadata(gasket, meta) {
      return {
        ...meta,

        structures: [
          {
            name: 'test/',
            description: 'Test files'
          },
          {
            name: 'cypress.json',
            description: 'Cypress configuration',
            link: 'https://docs.cypress.io/guides/references/configuration'
          }
        ]
      };
    }
  }
};

module.exports = plugin;
