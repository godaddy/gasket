/// <reference types="@gasket/plugin-command" />
/// <reference types="@gasket/plugin-docs" />
/// <reference types="@gasket/plugin-log" />

const path = require('path');
const timing = { before: ['@gasket/plugin-docs'] };

/** @type {import('@gasket/engine').HookHandler<'configure'>} */
async function handler(gasket, config) {
  const { docusaurus = {} } = config;
  const { rootDir = '.docs', docsDir = 'docs' } = docusaurus;

  if (config.docs && config.docs.outputDir) {
    gasket.logger.warning(
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
