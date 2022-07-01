const docsView = require('./docs-view');

module.exports = {
  name: require('../package').name,
  hooks: {
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
          name: 'docsify.port',
          link: 'README.md#configuration',
          description: 'Port to serve the docs from',
          type: 'number',
          default: 3000
        }, {
          name: 'docsify.config',
          link: 'README.md#configuration',
          description: `Any [Docsify config] properties, expect for functions types which are not currently supported. Default has \`auth2top\` and \`relativePath\` set to \`true\`, with \`maxLevel\` at \`3\`.`,
          type: 'object'
        }, {
          name: 'docsify.stylesheets',
          link: 'README.md#configuration',
          description: 'Optional additional stylesheet URLs to load',
          type: 'string[]'
        }, {
          name: 'docsify.scripts',
          link: 'README.md#configuration',
          description: 'Optional additional stylesheet URLs to load',
          type: 'string[]'
        }]
      };
    }
  }
};
