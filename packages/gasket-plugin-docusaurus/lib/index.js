const create = require('./create');
const docsView = require('./docs-view');
const configure = require('./configure');
const webpackConfig = require('./webpack-config');

const { name, version, description } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    create,
    configure,
    docsView,
    webpackConfig,
    metadata(gasket, meta) {
      return {
        ...meta,
        configurations: [
          {
            name: 'docusaurus',
            link: 'README.md#configuration',
            description: 'Docusaurus plugin config',
            type: 'object'
          },
          {
            name: 'docusaurus.rootDir',
            link: 'README.md#configuration',
            description: 'Root Docusaurus directory',
            type: 'string',
            default: '.docs'
          },
          {
            name: 'docusaurus.docsDir',
            link: 'README.md#configuration',
            description:
              'Sub-directory for the generated markdown from the docs plugin',
            type: 'string',
            default: 'docs'
          },
          {
            name: 'docusaurus.port',
            link: 'README.md#configuration',
            description: 'Port number to serve docs site',
            type: 'number',
            default: 3000
          },
          {
            name: 'docusaurus.host',
            link: 'README.md#configuration',
            description: 'Hostname to serve the docs from',
            type: 'string',
            default: 'localhost'
          }
        ]
      };
    }
  }
};

module.exports = plugin;
