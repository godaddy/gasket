/// <reference types="create-gasket-app" />

import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';
import packageJson from '../package.json' with { type: 'json' };
const { devDependencies, name, version } = packageJson;

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default async function create(gasket, createContext) {
  if (createContext.hasGasketIntl === false) {
    return;
  }

  // adjust config
  gasket.config.intl.locales = ['en-US', 'fr-FR'];
  gasket.config.intl.managerFilename = 'intl.js';
  gasket.config.intl.nextRouting = false;
  if (createContext.typescript) gasket.config.intl.managerFilename = 'intl.ts';

  const { files, pkg, gasketConfig } = createContext;
  const __filename = fileURLToPath(import.meta.url);
  const rootDir = new URL('..', pathToFileURL(__filename).toString()).pathname;
  const isReactProject = pkg.has('dependencies', 'react');
  files.add(`${rootDir}/generator/*`, `${rootDir}/generator/**/*`);

  gasketConfig.addPlugin('pluginIntl', name);

  const initialConfig = {
    locales: gasket.config.intl.locales,
    nextRouting: gasket.config.intl.nextRouting
  };

  if (createContext.typescript) {
    initialConfig.defaultLocale = 'en-US';
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
}
