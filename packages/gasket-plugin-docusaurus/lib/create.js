/// <reference types="create-gasket-app" />

const { name, version, devDependencies } = require('../package.json');

/** @type {import('@gasket/core').HookHandler<'create'>} */
module.exports = function create(gasket, { pkg, gasketConfig, readme, useDocs }) {
  if (!useDocs) return;

  gasketConfig.addPlugin('pluginDocusaurus', name);

  pkg.add('dependencies', {
    [name]: `^${version}`
  });

  pkg.add('devDependencies', {
    '@docusaurus/core': devDependencies['@docusaurus/core'],
    '@docusaurus/preset-classic': devDependencies['@docusaurus/preset-classic'],
    'react': devDependencies.react,
    'react-dom': devDependencies['react-dom'],
    'ajv': devDependencies.ajv,
    'typescript': devDependencies.typescript,
    'search-insights': devDependencies['search-insights']
  });

  readme
    .subHeading('Docusaurus')
    .link('Docusaurus', 'https://docusaurus.io/')
    .content('When using [Docusaurus], generated docs will be available at `http://localhost:3000` when running the [Docusaurus] server. By default the Docusaurus server is started with the `docs` script. Add the `--no-view` option to only generate the markdown files.');
};
