/// <reference types="create-gasket-app" />

const path = require('path');
const { devDependencies, name, version } = require('../package.json');

/** @type {import('@gasket/core').HookHandler<'create'>} */
module.exports = async function create(gasket, context) {
  const { files, pkg, gasketConfig } = context;
  const rootDir = path.join(__dirname, '..');
  const isReactProject = pkg.has('dependencies', 'react');
  files.add(`${rootDir}/generator/*`, `${rootDir}/generator/**/*`);

  gasketConfig.addPlugin('pluginIntl', name);

  pkg.add('dependencies', {
    [name]: `^${version}`
  });

  pkg.add('scripts', {
    prebuild: 'node gasket.js build'
  });

  if (isReactProject) {
    pkg.add('dependencies', {
      '@gasket/react-intl': devDependencies['@gasket/react-intl'],
      'react-intl': devDependencies['react-intl']
    });

    context.hasGasketIntl = true;

  }
};
