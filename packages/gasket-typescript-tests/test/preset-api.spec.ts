import type { Gasket, GasketConfigDefinition, Plugin } from '@gasket/core';
import type { Handler } from '@gasket/plugin-middleware';

describe('@gasket/preset-api', () => {
  const { log } = console;

  it('imports config type injections for all plugins', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
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
      version: '',
      description: '',
      hooks: {
        // @ts-expect-error - TODO clean up in tune up ticket
        // https://godaddy-corp.atlassian.net/browse/PFX-628
        preboot() {
          log('Preparing...');
        },
        servers(gasket, servers) {
          log(servers.http);
        },
        middleware(gasket: Gasket) {
          const middleware: Handler = (req, res, next) => {
            res.statusCode = 404;
            res.send({ message: 'not found' });
          };
          return [
            middleware
          ];
        }
      }
    };
  });
});
