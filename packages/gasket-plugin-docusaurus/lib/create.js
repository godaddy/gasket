/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-docs" />

const { name, version, devDependencies } = require('../package.json');

/** @type {import('@gasket/core').HookHandler<'create'>} */
module.exports = function create(gasket, { pkg, gasketConfig, readme, useDocusaurus }) {
  if (!useDocusaurus) return;

  gasketConfig.addCommand('docs', {
    dynamicPlugins: [
      `${name}`
    ]
  });

  pkg.add('devDependencies', {
    [name]: `^${version}`,
    '@docusaurus/core': devDependencies['@docusaurus/core'],
    '@docusaurus/preset-classic': devDependencies['@docusaurus/preset-classic'],
    'ajv': devDependencies.ajv,
    'typescript': devDependencies.typescript,
    'search-insights': devDependencies['search-insights']
  });

  // If used with non-react apps, add react and react-dom
  if (!pkg.has('dependencies', 'react')) {
    pkg.add('devDependencies', {
      'react': devDependencies.react,
      'react-dom': devDependencies['react-dom']
    });
  }

  readme
    .subHeading('Docusaurus')
    .link('Docusaurus', 'https://docusaurus.io/')
    .content('When using [Docusaurus], generated docs will be available at `http://localhost:3000` when running the [Docusaurus] server. By default the Docusaurus server is started with the `docs` script. Add the `--no-view` option to only generate the markdown files.');
};
