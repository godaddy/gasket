/* eslint-disable no-process-env */

const { GasketTrace } = await import('../lib/trace.js');
const { Gasket, makeGasket } = await import('../lib/gasket.js');

const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
});
const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
});

/** @type {import('@gasket/core').Plugin} */
const mockPlugin = {
  name: 'mockPlugin',
  actions: {
    doSomething: jest.fn((gasket) => 'the environment is ' + gasket.config.env),
    doAnotherThing: jest.fn((gasket) => 'the environment is ' + gasket.config.env)
  },
  hooks: {
    configure: jest.fn().mockImplementation((gasket, config) => {
      return {
        ...config,
        mockStage: 'configure hook'
      };
    })
  }
};

/** @type {import('@gasket/core').Plugin} */
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
    expect(gasket).toBeInstanceOf(Gasket);
  });

  it('exposes a symbol which can be used for keying in traces', () => {
    const gasket = makeGasket({ plugins: [mockPlugin] });
    expect(gasket.symbol).toEqual(expect.any(Symbol));

    expect(gasket.symbol).toBe(gasket.traceBranch().symbol);
    expect(gasket.symbol).toBe(gasket.traceBranch().traceBranch().symbol);
  });

  it('symbol can be used as a WeakMap key from root', () => {
    const data = { example: true };
    const map = new WeakMap();

    const gasket = makeGasket({ plugins: [mockPlugin] });
    const t1 = gasket.traceBranch();
    const t2 = t1.traceBranch();
    map.set(gasket.symbol, data);

    expect(map.has(gasket.symbol)).toBe(true);
    expect(map.has(t1.symbol)).toBe(true);
    expect(map.has(t2.symbol)).toBe(true);
  });

  it('symbol can be used as a WeakMap key from deep trace', () => {
    const data = { example: true };
    const map = new WeakMap();

    const gasket = makeGasket({ plugins: [mockPlugin] });
    const t1 = gasket.traceBranch();
    const t2 = t1.traceBranch();
    map.set(t2.symbol, data);

    expect(map.has(t2.symbol)).toBe(true);
    expect(map.has(t1.symbol)).toBe(true);
    expect(map.has(gasket.symbol)).toBe(true);
  });

  it('defaults env to local', () => {
    const gasket = makeGasket({ plugins: [mockPlugin] });
    expect(gasket.config.env).toEqual('local');
    expect(warnSpy).toHaveBeenCalledWith('No GASKET_ENV env variable set; defaulting to "local".');
  });

  it('sets env GASKET_ENV', () => {
    process.env.GASKET_ENV = 'production';
    const gasket = makeGasket({ plugins: [mockPlugin] });
    expect(gasket.config.env).toEqual('production');
    expect(warnSpy).not.toHaveBeenCalled();
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

    expect(() => makeGasket(initConfig)).toThrow('Plugin (faulty) must have hooks');
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
        expect.any(GasketTrace),
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
        expect.any(GasketTrace),
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
            actions: {
              mockAction
            },
            hooks: {}
          }
        ]
      });

      expect(mockAction).toHaveBeenCalled();
    });
  });

  describe('actions', () => {
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
        actions: {
          doSomething: () => 'first in!!'
        },
        hooks: {}
      });
      const gasket = makeGasket(inputConfig);
      const { doSomething } = gasket.actions;

      expect(errorSpy).toHaveBeenCalledWith(
        'Action \'doSomething\' from \'mockPlugin\' was registered by \'firstMockPlugin\''
      );
      expect(doSomething()).toEqual('first in!!');
    });
  });

  it('attachments to other branches', () => {
    const mockAttached = jest.fn();

    makeGasket({
      plugins: [
        {
          name: 'plugin-a',
          hooks: {
            init: {
              timing: {
                before: ['plugin-b']
              },
              handler: (gasket) => {
                // BEFORE plugin-b init
                expect(gasket).not.toHaveProperty('attached');
              }
            },
            configure(gasket, config) {
              // AFTER plugin-b init
              expect(gasket.attached).toBe(mockAttached);
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
                // AFTER plugin-b init
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
