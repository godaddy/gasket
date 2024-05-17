/// <reference types="@gasket/cli" />
/// <reference types="@gasket/plugin-docs" />
/// <reference types="@gasket/plugin-logger" />

const path = require('path');
const timing = { before: ['@gasket/plugin-docs'] };

/** @type {import('@gasket/core').HookHandler<'configure'>} */
function handler(gasket, config) {
  const { docusaurus = {} } = config;
  const { rootDir = '.docs', docsDir = 'docs' } = docusaurus;

  if (config.docs && config.docs.outputDir) {
    gasket.logger.warn(
      'Custom config for `docs.outputDir` found. Instead use `docusaurus.docsDir`.'
    );
  }

  return {
    ...config,
    docs: {
      ...config.docs,
      outputDir: path.join(rootDir, docsDir)
    },
    docusaurus: {
      ...docusaurus,
      rootDir,
      docsDir
    }
  };
}

module.exports = {
  handler,
  timing
};
