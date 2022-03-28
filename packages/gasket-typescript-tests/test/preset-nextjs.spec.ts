import type { GasketConfigFile, Plugin } from '@gasket/engine';
import '@gasket/preset-nextjs';

describe('@gasket/preset-nextjs', () => {
  const { log } = console;

  it('imports config type injections for all plugins', () => {
    const config: GasketConfigFile = {
      http: 8080,
      compression: true,
      log: {
        prefix: 'my-api'
      },
      nextConfig: {
        future: {
          webpack5: true
        }
      }
    };
  });

  it('imports lifecycles for all plugins', () => {
    const plugin: Plugin = {
      name: 'dummy-plugin',
      hooks: {
        preboot() {
          log('Preparing...');
        },
        servers(gasket, servers) {
          log(servers.http);
        },
        nextConfig(gasket, config) {
          return {
            ...config,
            future: {
              webpack5: true
            }
          };
        }
      }
    };
  });
});
