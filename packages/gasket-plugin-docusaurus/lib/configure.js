const path = require('path');
const timing = { before: ['@gasket/plugin-docs'] };

async function handler(gasket, config) {
  const { docusaurus = {}, docs = {} } = config;
  const { docsRoot = '.docs' } = docusaurus;
  const { outputDir = 'docs' } = docs;

  return {
    ...config,
    docs: {
      ...config.docs,
      outputDir: path.join(docsRoot, outputDir)
    },
    docusaurus: {
      ...docusaurus,
      docsDir: outputDir,
      docsRoot
    }
  };
}

module.exports = {
  handler,
  timing
};
