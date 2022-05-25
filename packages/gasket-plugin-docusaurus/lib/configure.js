const path = require('path');
const timing = { before: ['@gasket/plugin-docs'] };

async function handler(gasket, config) {
  const { docusaurus = {} } = config;
  const { docsDir = '.docs' } = docusaurus;

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
