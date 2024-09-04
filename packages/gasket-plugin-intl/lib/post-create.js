/// <reference types="create-gasket-app" />

/** @type {import('@gasket/core').HookHandler<'postCreate'>} */
module.exports = async function postCreateHook(gasket, createContext) {
  if (createContext.hasGasketIntl === false) {
    return;
  }

  const buildManifest = require('./build-manifest');
  const root = createContext.dest;
  await buildManifest(gasket, { root, silent: true });
  createContext.generatedFiles.add(gasket.config.intl.managerFilename);
};
