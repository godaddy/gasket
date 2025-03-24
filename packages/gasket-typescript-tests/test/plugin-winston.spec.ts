import { GasketConfigDefinition, Hook, Gasket } from '@gasket/core';
import '@gasket/plugin-winston';

const fakeTransport = (options: any) => void 0;

describe('@gasket/plugin-winston', () => {
  it('adds a winston config section', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
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
    const config: GasketConfigDefinition = {
      winston: {
        level: 'info',
        transports: [],
        silent: false,
        // @ts-expect-error
        bogus: 'bogus'
      }
    };

    const invalidAssignment = () => {
      // eslint-disable-next-line no-new-func
      new Function(`
        config.winston?.levels = 'bad string';
        config.winston?.format = false;
      `)();
    };

    expect(invalidAssignment).toThrow(SyntaxError);
  });

  // it('defines the winstonTransports lifecycle', async () => {
  //   const hook: Hook<'winstonTransports'> = (gasket: Gasket) => {
  //     return fakeTransport;
  //   };
  // });
});
