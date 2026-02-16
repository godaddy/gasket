/* eslint-disable vitest/expect-expect, jest/expect-expect */
import type { GasketConfigDefinition, Plugin } from '@gasket/core';

describe('@gasket/preset-nextjs', () => {
  const { log } = console;

  it('imports config type injections for all plugins', () => {
    const config: GasketConfigDefinition = {
      plugins: [
        { name: 'example-plugin', version: '', description: '', hooks: {} }
      ],
      http: 8080,
      express: {
        compression: true
      },
      nextConfig: {
        poweredByHeader: false
      }
    };
  });

  it('imports lifecycles for all plugins', () => {
    const plugin: Plugin = {
      name: 'dummy-plugin',
      version: '',
      description: '',
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
            poweredByHeader: false
          };
        }
      }
    };
  });
});
