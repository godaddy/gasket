/// <reference types="@gasket/cli" />

const { devDependencies } = require('../package.json');

/** @type {import('@gasket/engine').HookHandler<'create'>} */
module.exports = async function create(gasket, { pkg }) {
  pkg.add('devDependencies', {
    '@docusaurus/core': devDependencies['@docusaurus/core'],
    '@docusaurus/preset-classic': devDependencies['@docusaurus/preset-classic']
  });
};
