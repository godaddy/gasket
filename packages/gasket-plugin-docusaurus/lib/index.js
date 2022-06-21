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
        }]
      };
    }
  }
};
