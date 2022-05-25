const path = require('path');
const timing = { before: ['@gasket/plugin-docs'] };

async function handler(gasket, config) {
  const { docusaurus = {} } = config;
  const { docsDir = '.docs' } = docusaurus;

  if (config.docs && config.docs.outputDir) {
    gasket.logger.warning('Custom config for `docs.outputDir` found. Instead use `docusaurus.docsDir`.');
  }

  // Docusaurus requires a ./docs folder
  // config.docs.outputDir is required to be docs
  const outputDir = path.join(docsDir, 'docs');
  return {
    ...config,
    docs: {
      ...config.docs,
      outputDir
    },
    docusaurus: {
      ...docusaurus,
      docsDir
    }
  };
}

module.exports = {
  handler,
  timing
};
