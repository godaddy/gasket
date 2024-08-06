/// <reference types="create-gasket-app" />

const path = require('path');
const { devDependencies, name, version } = require('../package.json');

/** @type {import('@gasket/core').HookHandler<'create'>} */
module.exports = async function create(gasket, createContext) {
  if (createContext.hasGasketIntl === false) {
    return;
  }

  // adjust config
  gasket.config.intl.locales = ['en-US', 'fr-FR'];
  gasket.config.intl.managerFilename = 'intl.js';
  if (createContext.typescript) gasket.config.intl.managerFilename = 'intl.ts';

  const { files, pkg, gasketConfig } = createContext;
  const rootDir = path.join(__dirname, '..');
  const isReactProject = pkg.has('dependencies', 'react');
  files.add(`${rootDir}/generator/*`, `${rootDir}/generator/**/*`);

  gasketConfig.addPlugin('pluginIntl', name);

  const initialConfig = {
    locales: gasket.config.intl.locales
  };

  if (createContext.typescript) {
    initialConfig.managerFilename = gasket.config.intl.managerFilename;
  }

  gasketConfig.add('intl', initialConfig);

  pkg.add('dependencies', {
    [name]: `^${version}`
  });

  if (isReactProject) {
    pkg.add('dependencies', {
      '@gasket/intl': devDependencies['@gasket/intl'],
      '@gasket/react-intl': devDependencies['@gasket/react-intl'],
      'react-intl': devDependencies['react-intl']
    });
  }
};
