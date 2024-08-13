/* eslint-disable no-process-env */

import { makeGasket } from '../lib/index.js';

const { GasketProxy }  = await import('../lib/proxy.js');
const { Gasket }  = await import('../lib/gasket.js');

// eslint-disable-next-line no-unused-vars
const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
});
const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
});

/** @type {import('../lib/index').Plugin} */
const mockPlugin = {
  name: 'mockPlugin',
  hooks: {
    configure: jest.fn().mockImplementation((gasket, config) => {
      return {
        ...config,
        mockStage: 'configure hook'
      };
    }),
    actions: jest.fn().mockImplementation((gasket) => {
      return {
        doSomething: () => 'the environment is ' + gasket.config.env,
        doAnotherThing() {
          return 'the environment is ' + gasket.config.env;
        }
      };
    })
  }
};

/** @type {import('../lib/index').Plugin} */
const mockProdPlugin = {
  name: 'mockProdPlugin',
  hooks: {
    configure: jest.fn().mockImplementation((gasket, config) => {
      return {
        ...config,
        mockProd: 'configure hook'
      };
    })
  }
};

describe.skip('makeGasket', () => {
  let inputConfig;

  beforeEach(() => {
    inputConfig = {
      mockStage: 'input',
      plugins: [
        mockPlugin
      ],
      mode: 'test',
      environments: {
        production: {
          plugins: [
            mockPlugin,
            mockProdPlugin
          ],
          mode: 'prod'
        },
        development: {
          mode: 'dev'
        }
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.GASKET_ENV;
  });

  it('should return a Gasket instance', () => {
    const gasket = makeGasket({ plugins: [mockPlugin] });
    expect(gasket).toBeInstanceOf(Gasket);
  });

  it('defaults env to local', () => {
    const gasket = makeGasket({ plugins: [mockPlugin] });
    expect(gasket.config.env).toEqual('local');
    expect(console.warn).toHaveBeenCalledWith('No GASKET_ENV env variable set; defaulting to "local".');
  });

  it('sets env GASKET_ENV', () => {
    process.env.GASKET_ENV = 'production';
    const gasket = makeGasket({ plugins: [mockPlugin] });
    expect(gasket.config.env).toEqual('production');
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('prunes nullish and/or empty plugins', () => {
    const nullishPlugin = null;
    const emptyPlugin = {};
    const dummyPlugin = { name: 'dummy', hooks: {} };

    const initConfig = {
      plugins: [mockPlugin, nullishPlugin, emptyPlugin, dummyPlugin]
    };

    const gasket = makeGasket(initConfig);

    expect(gasket.config.plugins).toHaveLength(2);
    expect(gasket.config.plugins[0]).toHaveProperty('name', 'mockPlugin');
    expect(gasket.config.plugins[1]).toHaveProperty('name', 'dummy');
  });

  it('does not otherwise prune faulty plugins', () => {
    const nullishPlugin = null;
    const emptyPlugin = {};
    const dummyPlugin = { name: 'dummy', hooks: {} };
    const faultyPlugin = { name: 'faulty' };

    const initConfig = {
      plugins: [mockPlugin, nullishPlugin, emptyPlugin, dummyPlugin, faultyPlugin]
    };

    expect(() => makeGasket(initConfig)).toThrow(/must have a hooks/);
  });

  describe('config lifecycle', () => {

    it('applies env overrides', () => {
      process.env.GASKET_ENV = 'production';

      expect(inputConfig).toHaveProperty('environments', expect.any(Object));
      expect(inputConfig).toHaveProperty('mode', 'test');

      const gasket = makeGasket(inputConfig);

      expect(gasket.config).not.toHaveProperty('environments');
      expect(gasket.config).toHaveProperty('mode', 'prod');

      // verify that env overrides are applied before lifecycle
      expect(mockPlugin.hooks.configure).toHaveBeenCalledWith(
        expect.any(GasketProxy),
        expect.objectContaining({
          mode: 'prod',
          mockStage: 'input'
        })
      );
    });

    it('applies env overrides before instantiating plugin engine', () => {
      // -- verify by checking which hooks are called

      // test
      makeGasket(inputConfig);
      expect(mockPlugin.hooks.configure).toHaveBeenCalledTimes(1);
      expect(mockProdPlugin.hooks.configure).not.toHaveBeenCalled();

      // production
      process.env.GASKET_ENV = 'production';
      makeGasket(inputConfig);
      expect(mockPlugin.hooks.configure).toHaveBeenCalledTimes(2);
      expect(mockProdPlugin.hooks.configure).toHaveBeenCalledTimes(1);
    });

    it('executes configure lifecycle', () => {
      makeGasket(inputConfig);
      expect(mockPlugin.hooks.configure).toHaveBeenCalledWith(
        expect.any(GasketProxy),
        expect.objectContaining({
          mockStage: 'input'
        })
      );
    });

    it('attaches modified config to instance', () => {
      const gasket = makeGasket(inputConfig);
      expect(gasket.config).not.toEqual(inputConfig);
      expect(gasket.config).toHaveProperty('mockStage', 'configure hook');
    });

    it('actions are available to configure', () => {
      const mockAction = jest.fn();

      makeGasket({
        plugins: [
          {
            name: 'plugin-a',
            hooks: {
              configure(gasket, config) {
                gasket.actions.mockAction();
                return config;
              }
            }
          },
          {
            name: 'plugin-b',
            hooks: {
              actions() {
                return {
                  mockAction
                };
              }
            }
          }
        ]
      });

      expect(mockAction).toHaveBeenCalled();
    });
  });

  describe('actions lifecycle', () => {
    it('executes actions lifecycle', () => {
      makeGasket(inputConfig);
      expect(mockPlugin.hooks.actions).toHaveBeenCalledWith(
        expect.any(GasketProxy)
      );
    });

    it('attaches actions to instance', () => {
      const gasket = makeGasket(inputConfig);
      expect(gasket.actions).toEqual(expect.objectContaining({
        doSomething: expect.any(Function)
      }));
    });

    it('actions can be destructured', () => {
      const gasket = makeGasket(inputConfig);
      const { doSomething, doAnotherThing } = gasket.actions;

      expect(doSomething()).toEqual('the environment is local');
      expect(doAnotherThing()).toEqual('the environment is local');
    });

    it('warns on duplicate action names', () => {
      inputConfig.plugins.unshift({
        name: 'firstMockPlugin',
        hooks: {
          actions: jest.fn().mockImplementation(() => {
            return {
              doSomething: () => 'first in!!'
            };
          })
        }
      });
      const gasket = makeGasket(inputConfig);
      const { doSomething } = gasket.actions;

      expect(errorSpy).toHaveBeenCalledWith(
        'Action \'doSomething\' from \'mockPlugin\' was registered by \'firstMockPlugin\''
      );
      expect(doSomething()).toEqual('first in!!');
    });
  });

  it('attachments are only available on current driver', () => {
    const mockAttached = jest.fn();

    makeGasket({
      plugins: [
        {
          name: 'plugin-a',
          hooks: {
            configure(gasket, config) {
              expect(gasket).not.toHaveProperty('attached');
              return config;
            }
          }
        },
        {
          name: 'plugin-b',
          hooks: {
            init(gasket) {
              gasket.attached = mockAttached;
            }
          }
        },
        {
          name: 'plugin-c',
          hooks: {
            init: {
              timing: {
                after: ['plugin-b']
              },
              handler: (gasket) => {
                expect(gasket.attached).toBe(mockAttached);
                gasket.attached('from plugin-c init');
              }
            }
          }
        }
      ]
    });

    expect(mockAttached).toHaveBeenCalledTimes(1);
    expect(mockAttached).toHaveBeenCalledWith('from plugin-c init');
  });
});
