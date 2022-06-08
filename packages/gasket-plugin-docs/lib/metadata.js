/**
 * Attach additional metadata to pluginData
 *
 * @param {Gasket} gasket - Gasket
 * @param {object} meta - Initial meta data
 * @returns {object} Additional meta data
 */
module.exports = function metadata(gasket, meta) {
  const { outputDir } = gasket.config.docs || require('./configure').defaultConfig;
  return {
    ...meta,
    commands: [{
      name: 'docs',
      description: 'Generate docs for the app',
      link: 'README.md#commands'
    }],
    lifecycles: [{
      name: 'docsSetup',
      description: 'Set up what docs are captured and how to transform them',
      link: 'README.md#docsSetup',
      command: 'docs'
    }, {
      method: 'exec',
      name: 'docsView',
      description: 'View the collated documentation',
      link: 'README.md#docsView',
      command: 'docs',
      after: 'docsSetup'
    }, {
      method: 'exec',
      name: 'docsGenerate',
      description: 'Generate graphs for display in documation',
      link: 'README.md#docsGenerate',
      command: 'docs',
      after: 'docsSetup'
    }],
    structures: [{
      name: outputDir + '/',
      description: 'Output of the docs command',
      link: 'README.md#options'
    }],
    configurations: [{
      name: 'docs',
      link: 'README.md#configuration',
      description: 'Docs config object',
      type: 'object',
      default: '{}'
    }, {
      name: 'docs.outputDir',
      link: 'README.md#configuration',
      description: 'Output directory for generated docs',
      type: 'string',
      default: '.docs'
    }]
  };
};
