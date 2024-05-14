/// <reference types="@gasket/cli" />

const path = require('path');
const { devDependencies } = require('../package.json');

/** @type {import('@gasket/engine').HookHandler<'create'>} */
module.exports = async function create(gasket, context) {
  const { files, pkg } = context;
  const rootDir = path.join(__dirname, '..');
  const isReactProject = pkg.has('dependencies', 'react');

  files.add(`${rootDir}/generator/*`, `${rootDir}/generator/**/*`);

  if (isReactProject) {
    pkg.add('dependencies', {
      '@gasket/react-intl': devDependencies['@gasket/react-intl'],
      'react-intl': devDependencies['react-intl']
    });

    context.hasGasketIntl = true;
  }
};
