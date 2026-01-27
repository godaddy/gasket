import docsView from './docs-view.js';
import configure from './configure.js';
import webpackConfig from './webpack-config.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
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

export default plugin;
