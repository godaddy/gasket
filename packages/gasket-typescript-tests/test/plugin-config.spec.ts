import { Gasket, GasketConfig, GasketConfigFile, Hook } from "@gasket/engine";
import '@gasket/plugin-config';

describe('@gasket/plugin-config', () => {
  type MyAppConfig = {
    serviceName: string,
    maxRequestsPerSecond: number
  }

  it('adds an optional configPath property to gasket config', () => {
    const config: GasketConfigFile = {
      configPath: './config/path'
    };
  });

  it('validates the configPath config property', () => {
    const config: GasketConfigFile = {
      // @ts-expect-error
      configPath: 4
    };
  });

  it('defines the appEnvConfig lifecycle', () => {
    const hook: Hook<'appEnvConfig'> = (gasket: Gasket, config: MyAppConfig): MyAppConfig => ({
      ...config,
      maxRequestsPerSecond: 100
    });
  });

  it('defines the appRequestConfig lifecycle', () => {
    const hook: Hook<'appRequestConfig'> = (gasket, config, req, res) => ({
      ...config,
      serviceName: req.headers.host ?? config.serviceName
    });
  });
});
