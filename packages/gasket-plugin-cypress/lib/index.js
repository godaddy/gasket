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
            '@testing-library/react': devDependencies['@testing-library/react']
          });
        }
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
