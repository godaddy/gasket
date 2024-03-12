import type { GasketConfigDefinition, Plugin } from '@gasket/engine';
import '@gasket/preset-nextjs';

describe('@gasket/preset-nextjs', () => {
  const { log } = console;

  it('imports config type injections for all plugins', () => {
    const config: GasketConfigDefinition = {
      plugins: [
        { name: 'example-plugin', hooks: {} }
      ],
      http: 8080,
      express: {
        compression: true
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
