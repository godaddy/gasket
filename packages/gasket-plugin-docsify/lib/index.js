// const create = require('./create');
const docsView = require('./docs-view');

module.exports = {
  name: require('../package').name,
  hooks: {
    // create,
    docsView,
    metadata(gasket, meta) {
      return {
        ...meta,
        configurations: [{
          name: 'docsify',
          link: 'README.md#configuration',
          description: 'Docsify config object',
          type: 'object'
        }, {
          name: 'docsify.theme',
          link: 'README.md#configuration',
          description: 'Name of the theme',
          type: 'string',
          default: 'styles/gasket.css'
        }, {
          name: 'docsify.port',
          link: 'README.md#configuration',
          description: 'Port to serve the docs from',
          type: 'number',
          default: 3000
        }, {
          name: 'docsify.config',
          link: 'README.md#configuration',
          description: `Docsify configuration properties, excluding functions`,
          type: 'object'
        }, {
          name: 'docsify.stylesheets',
          link: 'README.md#configuration',
          description: 'Optional additional stylesheet URLs to load',
          type: 'string[]'
        }, {
          name: 'docsify.scripts',
          link: 'README.md#configuration',
          description: 'Optional additional script files, which can include docsify plugins',
          type: 'string[]'
        }]
      };
    }
  }
};
