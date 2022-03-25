import type { Gasket, GasketConfigFile, Hook } from "@gasket/engine";
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
        level: 'warn',
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

      close(): Promise<any> {
        return Promise.resolve(undefined);
      },
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

      // @ts-ignore-error
      close() {},

      custom(...args: any): void {}
    };
  });
});
