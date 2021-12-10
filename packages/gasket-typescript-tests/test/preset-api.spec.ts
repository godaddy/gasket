import type { Gasket, GasketConfigFile, Plugin } from '@gasket/engine';
import '@gasket/preset-api';

describe('@gasket/preset-api', () => {
  it('imports config type injections for all plugins', () => {
    const config: GasketConfigFile = {
      http: 8080,
      compression: true,
      log: {
        prefix: 'my-api'
      },
      swagger: {
        ui: {
          isExplorer: true
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
        middleware(gasket) {
          return [
            (req, res, next) => {
              res.statusCode = 404;
              res.send({ message: 'not found' });
            }
          ]
        }
      }
    }
  });
});
