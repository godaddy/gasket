/* eslint-disable no-process-env */

import { makeGasket, GasketEngine } from '../lib/index.js';

// eslint-disable-next-line no-unused-vars
const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

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

describe('makeGasket', () => {
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
    expect(gasket).toBeInstanceOf(GasketEngine);
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
        gasket,
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
      const gasket = makeGasket(inputConfig);
      expect(mockPlugin.hooks.configure).toHaveBeenCalledWith(
        gasket,
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
      const gasket = makeGasket(inputConfig);
      expect(mockPlugin.hooks.actions).toHaveBeenCalledWith(
        gasket
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

      expect(doSomething()).toEqual('the environment is test');
      expect(doAnotherThing()).toEqual('the environment is test');
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
        "Action 'doSomething' from 'mockPlugin' was registered by 'firstMockPlugin'"
      );
      expect(doSomething()).toEqual('first in!!');
    });
  });

  describe('init lifecycle', () => {


    it('init attachments are available to actions and to configure', () => {
      const mockAction = jest.fn();
      const mockAttached = jest.fn();

      makeGasket({
        plugins: [
          {
            name: 'plugin-a',
            hooks: {
              configure(gasket, config) {
                gasket.attached('from configure');
                gasket.actions.mockAction();
                return config;
              }
            }
          },
          {
            name: 'plugin-b',
            hooks: {
              actions(gasket) {
                gasket.attached('from actions');
                mockAction.mockImplementation(() => {
                  gasket.attached('from within action');
                });

                return {
                  mockAction
                };
              }
            }
          },
          {
            name: 'plugin-c',
            hooks: {
              init(gasket) {
                gasket.attached = mockAttached;
              }
            }
          }
        ]
      });

      expect(mockAction).toHaveBeenCalled();
      expect(mockAttached).toHaveBeenCalledTimes(3);
      expect(mockAttached).toHaveBeenCalledWith('from configure');
      expect(mockAttached).toHaveBeenCalledWith('from actions');
      expect(mockAttached).toHaveBeenCalledWith('from within action');
    });
  });
});
