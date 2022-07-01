import type { Gasket, GasketConfigFile, Hook } from '@gasket/engine';
import type Log from '@gasket/log';
import { transports } from 'winston';
import '@gasket/plugin-log';

describe('@gasket/plugin-log', () => {
  it('adds a log and winston config property', () => {
    const config: GasketConfigFile = {
      log: {
        prefix: 'my-app'
      },

      winston: {
        level: 'warn'
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
    };
  });

  it('errors for incorrect transport types', () => {
    // @ts-expect-error
    const handler: Hook<'logTransports'> = (gasket: Gasket) => {
      return [
        () => {}
      ];
    };
  });

  it('adds a logger property to Gasket', () => {
    const logger: Log = {
      alert(...args: any): void {},
      crit(...args: any): void {},
      debug(...args: any): void {},
      emerg(...args: any): void {},
      error(...args: any): void {},
      info(...args: any): void {},
      warning(...args): void {},
      notice(...args): void {},
      log(...args: any): void {},

      async close(): Promise<any> {}
    };
  });

  it('logger instance allows custom level method', () => {
    const logger2: Log = {
      alert(...args: any): void {},
      crit(...args: any): void {},
      debug(...args: any): void {},
      emerg(...args: any): void {},
      error(...args: any): void {},
      info(...args: any): void {},
      warning(...args): void {},
      notice(...args): void {},
      log(...args: any): void {},

      async close(): Promise<any> {},

      custom(...args: any): void {}
    };
  });
});
