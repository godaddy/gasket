const path = require('path');
const timing = { before: [ '@gasket/plugin-docs' ]};

async function handler(gasket, config) {
  const { docusaurus = {} } = config;
  const { docsDir = '.docs' } = docusaurus;

  // Docusaurus requires a ./docs folder
  // config.docs.outputDir is required to be docs
  config.docs = {};
  config.docs.outputDir = path.join(docsDir, 'docs');
  return config;
};

module.exports = {
  handler,
  timing
};
