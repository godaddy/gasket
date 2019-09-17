module.exports = function metadata(gasket, meta) {
  const { dir } = gasket.config.docs;
  return {
    ...meta,
    commands: [{
      name: 'docs',
      description: 'Collocates documentation from configured presets and plugins',
      link: 'README.md#commands'
    }],
    lifecycles: [{
      name: 'docs',
      description: 'Adjust what docs are captured and how to transform them',
      link: 'README.md#docs-1'
    }, {
      name: 'docsView',
      description: 'View the collocated documentation',
      link: 'README.md#docsView'
    }],
    structures: [{
      name: dir,
      description: 'Output of gasket docs command'
    }]
  };
};
