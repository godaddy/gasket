const docsView = require('./docs-view');
const configure = require('./configure');

module.exports = {
  name: require('../package').name,
  hooks: {
    configure,
    docsView,
    metadata(gasket, meta) {
      return {
        ...meta,
        configurations: [{
          name: 'docusaurus',
          link: 'README.md#configuration',
          description: 'Docusaurus config file.',
          type: 'object',
          default: '{}'
        }, {
          name: 'docusaurus.rootDir',
          link: 'README.md#configuration',
          description: 'Root Docusaurus directory.',
          type: 'string',
          default: '.docs'
        }, {
          name: 'docusaurus.docsDir',
          link: 'README.md#configuration',
          description: 'Sub-directory for the generated markdown from the docs plugin.',
          type: 'string',
          default: 'docs'
        }, {
          name: 'docusaurus.port',
          link: 'README.md#configuration',
          description: 'Sub-directory for the generated markdown from the docs plugin.',
          type: 'number',
          default: 3000
        }, {
          name: 'docusaurus.host',
          link: 'README.md#configuration',
          description: 'Hostname to serve the docs from.',
          type: 'string',
          default: 'localhost'
        }]
      };
    }
  }
};
