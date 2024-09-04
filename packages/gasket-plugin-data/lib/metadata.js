/// <reference types="@gasket/plugin-metadata" />

/** @type {import('@gasket/core').HookHandler<'metadata'>} */
function metadata(gasket, meta) {
  return {
    ...meta,
    actions: [
      {
        name: 'getGasketData',
        description: 'Get the Gasket data',
        link: 'README.md'
      },
      {
        name: 'getPublicGasketData',
        description: 'Get the public Gasket data',
        link: 'README.md'
      }
    ],
    lifecycles: [
      {
        name: 'gasketData',
        method: 'execWaterfall',
        description: 'Adjust app level data after merged for the env',
        link: 'README.md#gasketData'
      },
      {
        name: 'publicGasketData',
        method: 'execWaterfall',
        description: 'Adjust response level data for each request',
        link: 'README.md#publicGasketData'
      }
    ],
    structures: [
      {
        name: 'gasket-data.js',
        description: 'App configuration with environment overrides',
        link: 'README.md'
      }
    ]
  };
}

module.exports = metadata;
