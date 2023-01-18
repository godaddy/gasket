const mockLog = jest.fn();

jest.mock('@gasket/log', () => mockLog);

const Plugin = require('../lib/index');

describe('Plugin', function () {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is an object', () => {
    expect(typeof Plugin).toBe('object');
  });

  it('has expected name', () => {
    expect(Plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'init',
      'create',
      'destroy',
      'metadata'
    ];

    expect(Plugin).toHaveProperty('hooks');

    const hooks = Object.keys(Plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  describe('.init', function () {
    it('runs on the init lifecycle event', function () {
      expect(typeof Plugin.hooks.init.handler).toBe('function');
      expect(Plugin.hooks.init.handler).toHaveLength(1);
    });

    it('runs after the lifecycle plugin', function () {
      expect(Plugin.hooks.init.timing).toHaveProperty('after');
      expect(Plugin.hooks.init.timing.after).toContain('@gasket/plugin-lifecycle');
    });

    it('adds a logger instance to the Gasket object', async function () {
      const gasket = {
        exec: async function exec() {
        },
        command: {
          id: 'bogus'
        },
        config: {
          env: 'test',
          winston: {}
        }
      };

      expect(gasket).not.toHaveProperty('logger');
      await Plugin.hooks.init.handler(gasket);
      expect(gasket).toHaveProperty('logger');
    });

    it('execs the logTransports hook', async () => {
      const exec = jest.fn().mockResolvedValue();
      const gasket = {
        exec,
        command: {
          id: 'start'
        },
        config: {
          env: 'test'
        }
      };

      await Plugin.hooks.init.handler(gasket);
      expect(exec).toHaveBeenCalledWith('logTransports');
    });

    it('merges in any transports returned by the logTransports hook', async () => {
      // eslint-disable-next-line no-undefined
      const exec = jest.fn().mockResolvedValue(['bar', 'bazz', undefined, ['apple', 'banana'], [undefined]]);
      const gasket = {
        exec,
        command: {
          id: 'start'
        },
        config: {
          env: 'test',
          winston: {
            transports: ['foo']
          }
        }
      };
      await Plugin.hooks.init.handler(gasket);
      expect(mockLog.mock.calls[0][0].transports).toEqual(['foo', 'bar', 'bazz', 'apple', 'banana']);
      expect(exec).toHaveBeenCalledWith('logTransports');
    });

    it('sets defaults appropriately', async () => {
      const gasket = {
        exec: async function exec() {
          return null;
        },
        command: {
          id: 'start'
        },
        config: {
          env: 'test'
        }
      };

      await Plugin.hooks.init.handler(gasket);
      expect(mockLog.mock.calls[0][0].local).toBe(false);
      expect(Array.isArray(mockLog.mock.calls[0][0].transports)).toBe(true);
    });

    it('sets local option for local env', async () => {
      const gasket = {
        exec: jest.fn(),
        command: {
          id: 'start'
        },
        config: {
          env: 'local'
        }
      };

      await Plugin.hooks.init.handler(gasket);
      expect(mockLog.mock.calls[0][0].local).toBe(true);
    });

    it('sets local option for non-start commands', async () => {
      const gasket = {
        exec: jest.fn(),
        command: {
          id: 'fake'
        },
        config: {
          env: 'test'
        }
      };

      await Plugin.hooks.init.handler(gasket);
      expect(mockLog.mock.calls[0][0].local).toBe(true);
    });

    it('supports older gasket.command format', async () => {
      const gasket = {
        exec: jest.fn(),
        command: 'start',
        config: {
          env: 'test'
        }
      };

      await Plugin.hooks.init.handler(gasket);
      expect(mockLog.mock.calls[0][0].local).toBe(false);
    });

    it('forces { exitOnError: true }', async () => {
      const gasket = {
        exec: async function exec() {
        },
        command: {
          id: 'bogus'
        },
        config: {
          winston: { exitOnError: false }
        }
      };

      await Plugin.hooks.init.handler(gasket);
      expect(mockLog.mock.calls[0][0].exitOnError).toBe(true);
    });

    it('merges the correct configuration', async () => {
      const gasket = {
        exec: async function exec() {
        },
        config: {
          env: 'local',
          winston: {
            transports: ['foo', 'bar'],
            silent: false
          },
          log: { silent: true }
        }
      };

      await Plugin.hooks.init.handler(gasket);
      expect(mockLog.mock.calls[0][0].local).toBe(true);
      expect(mockLog.mock.calls[0][0].transports).toEqual(['foo', 'bar']);
      expect(mockLog.mock.calls[0][0].silent).toBe(true);
    });
  });

  describe('.create', function () {
    it('adds the expected dependencies', async function () {
      const calls = [];
      const spy = {
        pkg: {
          add(key, value) {
            calls.push({ key, value });
          }
        }
      };

      await Plugin.hooks.create({}, spy);
      expect(calls).toEqual([
        { key: 'dependencies', value: { '@gasket/log': require('../package').dependencies['@gasket/log'] } }
      ]);
    });
  });

  describe('.destroy', function () {
    it('has destroy lifecycle event', function () {
      expect(typeof Plugin.hooks.destroy).toBe('function');
      expect(Plugin.hooks.destroy).toHaveLength(1);
    });

    it('closes logger instance', async function () {
      const gasket = {
        logger: {
          close: jest.fn()
        }
      };

      await Plugin.hooks.destroy(gasket);
      expect(gasket.logger.close).toHaveBeenCalled();
    });
  });
});
