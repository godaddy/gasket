import type { Gasket, GasketConfigFile, Hook } from "@gasket/engine";
import { transports } from 'winston';
import '@gasket/plugin-log';

describe('@gasket/plugin-log', () => {
  it('adds a log and winston config property', () => {
    const config: GasketConfigFile = {
      log: {
        prefix: 'my-app'
      },

      winston: {
        level: 'warning'
      },
    
      environments: {
        local: {
          winston: {
            level: 'debug'
          }
        }
      }
    };
  });

  it('adds a logTransports lifecycle', () => {
    const handler: Hook<'logTransports'> = (gasket: Gasket) => {
      return [
        new transports.Console()
      ];
    }
  });
});
