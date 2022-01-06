import type { GasketConfigFile, Hook } from "@gasket/engine";
import type { ClientRequest, ServerResponse } from 'http';
import '@gasket/plugin-https';

describe('@gasket/plugin-https', () => {
  it('adds an optional http config property', () => {
    const config: GasketConfigFile = {
      http: 8080,
      environments: {
        local: {
          http: null
        }
      }
    }
  });

  it('adds an optional https config property', () => {
    const config: GasketConfigFile = {
      environments: {
        local: {
          https: {
            port: 8443,
            key: '/some/key/path.key',
            cert: [
              './some/cert/path.crt',
              './some/intermediate/path.crt'
            ]
          }
        }
      }
    }
  })

  it('adds an optional http2 config property', () => {
    const config: GasketConfigFile = {
      environments: {
        local: {
          http2: {
            port: 8443,
            key: '/some/key/path.key',
            cert: [
              './some/cert/path.crt',
              './some/intermediate/path.crt'
            ],
            allowHTTP1: true
          }
        }
      }
    }
  });

  it('adds terminus config typings', () => {
    const config: GasketConfigFile = {
      terminus: {
        healthChecks: {
          '/you-ok-over-there': async () => 'ok'
        }
      }
    }
  });

  it('adds the createServers lifecycle', () => {
    const handler: Hook<'createServers'> = (gasket, configs) => {
      return {
        ...configs,
        handler: (req: ClientRequest, res: ServerResponse) => res.end('ok')
      }
    }
  })

  it('validates the createServers return value', () => {
    // @ts-expect-error
    const handler: Hook<'createServers'> = (gasket, configs) => {
      return {
        unknown: 'garbage'
      }
    }
  })

  it('adds the servers lifecycle', () => {
    const handler: Hook<'servers'> = (gasket, servers) => {
      console.log(servers.http2);
    }
  })

  it('adds the terminus lifecycle', () => {
    const handler: Hook<'terminus'> = (gasket, config) => {
      console.log(config.signals);
      return config;
    }
  });

  it('adds the healthcheck lifecycle', () => {
    const handler: Hook<'healthcheck'> = (gasket, HealthcheckError) => {
      if (Math.random() > 0.5) {
        throw new HealthcheckError('Naw...', 'Do not want to')
      }
    }
  });

  it('adds the onSendFailureDuringShutdown [sic] lifecycle', () => {
    const handler: Hook<'onSendFailureDuringShutdown'> = (gasket) => {
      console.log('Hang on a second here...')
    }
  });

  it('adds the beforeShutdown lifecycle', () => {
    const handler: Hook<'beforeShutdown'> = async (gasket) => {
      // await shutdownTheThing();
    }
  });

  it('adds the onSignal lifecycle', () => {
    const handler: Hook<'onSignal'> = async (gasket) => {
      console.log('Oh my...');
    }
  });

  it('adds the onShutdown lifecycle', () => {
    const handler: Hook<'onShutdown'> = async (gasket) => {
      // await cleanupStuff();
    }
  });
});
