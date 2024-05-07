import { Gasket, GasketConfig, GasketConfigDefinition, Hook } from '@gasket/core';
import '@gasket/plugin-response-data';

describe('@gasket/plugin-response-data', () => {

  it('adds an optional configPath property to gasket config', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', hooks: {} }],
      gasketDataDir: './custom/path'
    };
  });

  it('validates the configPath config property', () => {
    const config: GasketConfigDefinition = {
      // @ts-expect-error
      configPath: 4
    };
  });

  it('defines the gasketData lifecycle', () => {
    const hook: Hook<'gasketData'> = (gasket: Gasket, config): object => ({
      ...config,
      maxRequestsPerSecond: 100
    });
  });

  it('defines the responseData lifecycle', () => {
    const hook: Hook<'responseData'> = (gasket, config, { req, res }) => ({
      ...config,
      serviceName: req.headers.host
    });
  });
});
