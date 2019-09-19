/**
 * Attach additional metadata to pluginInfo
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} meta - Initial meta data
 * @returns {Object} Additional meta data
 */
module.exports = function metadata(gasket, meta) {
  const { outputDir } = gasket.config.docs;
  return {
    ...meta,
    commands: [{
      name: 'docs',
      description: 'Collates documentation from configured presets and plugins',
      link: 'README.md#commands'
    }],
    lifecycles: [{
      name: 'docsSetup',
      description: 'Set up what docs are captured and how to transform them',
      link: 'README.md#docsSetup',
      command: 'docs'
    }, {
      name: 'docsView',
      description: 'View the collated documentation',
      link: 'README.md#docsView',
      command: 'docs'
    }],
    structures: [{
      name: outputDir,
      description: 'Output of gasket docs command'
    }]
  };
};
