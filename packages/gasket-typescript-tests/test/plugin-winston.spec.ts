import { GasketConfigFile, Hook, Gasket } from '@gasket/engine';
import '@gasket/plugin-winston';

const fakeTransport = (options: any) => void 0;

describe('@gasket/plugin-winston', () => {
  it('adds a winston config section', () => {
    const config: GasketConfigFile = {
      winston: {
        level: 'info',
        transports: [],
        silent: false,
        levels: {
          emerg: 0,
          alert: 1,
          crit: 2,
          error: 3,
          warning: 4,
          notice: 5,
          info: 6,
          debug: 7
        }
      }
    };
  });

  it('throws an error on bogus winston options', () => {
    const config: GasketConfigFile = {
      winston: {
        level: 'info',
        transports: [],
        silent: false,
        // @ts-expect-error
        bogus: 'bogus'
      }
    };

    // @ts-expect-error
    config.winston?.levels = 'bad string';

    // @ts-expect-error
    config.winston?.format = false;
  });

  it('defines the winstonTransports lifecycle', async() => {
    const hook: Hook<'winstonTransports'> = (gasket: Gasket) => {
      return fakeTransport;
    };
  });
});
