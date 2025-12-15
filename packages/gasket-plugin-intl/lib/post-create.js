/// <reference types="create-gasket-app" />

import buildManifest from './build-manifest.js';

/**
 * PostCreate lifecycle hook - builds intl manifest after app creation
 * @type {import('@gasket/core').HookHandler<'postCreate'>}
 * @param {import('@gasket/core').Gasket} gasket - Gasket instance
 * @param {import('create-gasket-app').CreateContext} createContext - Create context
 * @returns {Promise<void>} Promise that resolves when manifest is built
 */
export default async function postCreateHook(gasket, createContext) {
  if (createContext.hasGasketIntl === false) {
    return;
  }

  const root = createContext.dest;
  await buildManifest(gasket, { root, silent: true });
  createContext.generatedFiles.add(gasket.config.intl.managerFilename);
}
