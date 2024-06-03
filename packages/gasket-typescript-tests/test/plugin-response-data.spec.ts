import { Gasket, GasketConfigDefinition, Hook } from '@gasket/core';
import '@gasket/plugin-data';

describe('@gasket/plugin-data', () => {

  it('adds an optional data property to gasket config', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', hooks: {} }],
      data: {
        some: 'data',
        public: {
          some: 'public'
        },
        environments: {
          production: {
            some: 'override'
          }
        }
      }
    };
  });

  it('validates the data config property', () => {
    const config: GasketConfigDefinition = {
      // @ts-expect-error
      data: 'should be an object'
    };
  });

  it('defines the gasketData lifecycle', () => {
    const hook: Hook<'gasketData'> = (gasket: Gasket, config): object => ({
      ...config,
      maxRequestsPerSecond: 100
    });
  });

  it('defines the responseData lifecycle', () => {
    const hook: Hook<'publicGasketData'> = (gasket, config, { req }) => ({
      ...config,
      serviceName: req.headers.host
    });
  });
});
