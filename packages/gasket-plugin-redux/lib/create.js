/// <reference types="@gasket/cli" />

const { devDependencies } = require('../package.json');

/** @type {import('@gasket/engine').HookHandler<'create'>} */
module.exports = async function create(gasket, context) {
  const { pkg, files } = context;
  const generatorDir = `${__dirname}/../generator`;

  pkg.add('dependencies', {
    '@gasket/redux': devDependencies['@gasket/redux'],
    'react-redux': devDependencies['react-redux'],
    'redux': devDependencies.redux
  });

  files.add(`${generatorDir}/*`, `${generatorDir}/**/*`);

  context.hasGasketRedux = true;
};
