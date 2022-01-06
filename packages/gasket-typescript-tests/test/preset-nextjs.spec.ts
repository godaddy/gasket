import type { GasketConfigFile, Plugin } from '@gasket/engine';
import '@gasket/preset-nextjs';

describe('@gasket/preset-nextjs', () => {
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
    }
  });

  it('imports lifecycles for all plugins', () => {
    const plugin: Plugin = {
      name: "dummy-plugin",
      hooks: {
        preboot() {
          console.log('Preparing...')
        },
        servers(gasket, servers) {
          console.log(servers.http);
        },
        nextConfig(gasket, config) {
          return {
            ...config,
            future: {
              webpack5: true
            }
          }
        }
      }
    }
  });
});
