/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-metadata" />

import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').HookHandler<'metadata'>} */
export default async function metadata(gasket, meta) {
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
