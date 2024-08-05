/** @type {import('@gasket/core').HookHandler<'build'>} */
module.exports = async function postCreateHook(gasket, createContext) {
  const buildManifest = require('./build-manifest');
  const root = createContext.dest;
  await buildManifest(gasket, { root, silent: true });
  createContext.generatedFiles.add('intl.js');
};
