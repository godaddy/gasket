const { devDependencies, name } = require('../package.json');

module.exports = {
  name,
  hooks: {
    create: {
      timing: {
        last: true,
        before: ['@gasket/plugin-lint']
      },

      handler: async function create(gasket, { files, pkg, packageManager = 'npm' }) {
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
          cypress: 'cypress open',
          'cypress:headless': 'cypress run',

          e2e: 'start-server-and-test start http://localhost:80 cypress',
          'e2e:headless':
            'start-server-and-test start http://localhost:80 cypress:headless'
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
