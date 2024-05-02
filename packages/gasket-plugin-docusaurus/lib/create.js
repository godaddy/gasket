const { name, version, devDependencies } = require('../package.json');

module.exports = async function create(gasket, { pkg, gasketConfig }) {
  gasketConfig.addPlugin('pluginDocusaurus', name);
  pkg.add('dependencies', {
    [name]: `^${version}`
  });
  pkg.add('devDependencies', {
    '@docusaurus/core': devDependencies['@docusaurus/core'],
    '@docusaurus/preset-classic': devDependencies['@docusaurus/preset-classic'],
    'react': devDependencies.react
  });
};
