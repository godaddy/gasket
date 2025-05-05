/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-metadata" />

const { name, version, description } = require('../package.json');

/** @type {import('@gasket/core', { with: { "resolution-mode": "import" } }).HookHandler<'metadata'>} */
async function metadata(gasket, meta) {
  return {
    ...meta,
    name,
    version,
    description,
    actions: [
      {
        name: 'getGasketData',
        description: 'Get the Gasket data',
        link: 'README.md#getGasketData'
      },
      {
        name: 'getPublicGasketData',
        description: 'Get the public Gasket data',
        link: 'README.md#getPublicGasketData'
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
