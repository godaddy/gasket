const { devDependencies } = require('../package.json');

module.exports = async function create(gasket, { pkg }) {
  pkg.add('devDependencies', {
    '@docusaurus/core': devDependencies['@docusaurus/core'],
    '@docusaurus/preset-classic': devDependencies['@docusaurus/preset-classic']
  });
};
