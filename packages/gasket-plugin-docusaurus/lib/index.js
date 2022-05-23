const docsView = require('./docs-view');
const mkdirp = require('mkdirp');
const path = require('path');

module.exports = {
  name: '@gasket/plugin-docusaurus',
  hooks: {
    docsView,
    configure: {
      handler: async (gasket, config) => {
        const { docusaurus = {} } = config;
        const { docsDir = '.docs' } = docusaurus;
        await mkdirp(docsDir);

        // Docusaurus requires a ./docs folder
        // config.docs.outputDir is required to be docs
        config.docs = {};
        config.docs.outputDir = path.join(docsDir, 'docs');
        return config;
      },
      timing: {
        before: [
          '@gasket/plugin-docs'
        ]
      }
    }
  }
};
