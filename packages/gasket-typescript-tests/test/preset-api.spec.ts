import type { Gasket, GasketConfigDefinition, Plugin } from '@gasket/core';
import preset from '@gasket/preset-api';

describe('@gasket/preset-api', () => {
  const { log } = console;

  it('imports config type injections for all plugins', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', hooks: {} }],
      http: 8080,
      express: {
        compression: true
      },
      swagger: {
        ui: {
          isExplorer: true
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
        middleware(gasket) {
          return [
            (req, res, next) => {
              res.statusCode = 404;
              res.send({ message: 'not found' });
            }
          ];
        }
      }
    };
  });
});
