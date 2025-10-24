/// <reference types="create-gasket-app" />

/** @type {import('@gasket/core').HookHandler<'postCreate'>} */
import buildManifest from './build-manifest.js';

export default async function postCreateHook(gasket, createContext) {
  if (createContext.hasGasketIntl === false) {
    return;
  }

  const root = createContext.dest;
  await buildManifest(gasket, { root, silent: true });
  createContext.generatedFiles.add(gasket.config.intl.managerFilename);
}
