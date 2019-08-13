describe('The execMap method', () => {
  let engine, hookASpy, hookBSpy, hookCSpy;

  const mockConfig = {
    some: 'config',
    plugins: {
      add: ['testa', 'testb', 'testc']
    }
  };

  const pluginA = {
    hooks: {
      eventA() {
        return Promise.resolve(1);
      }
    }
  };

  const pluginB = {
    hooks: {
      eventA() {
        return 2;
      }
    }
  };

  const pluginC = {
    hooks: {
      eventA: {
        timing: { after: ['testa'] },
        handler: () => 3
      }
    }
  };

  beforeEach(() => {
    hookASpy = jest.spyOn(pluginA.hooks, 'eventA');
    hookBSpy = jest.spyOn(pluginB.hooks, 'eventA');
    hookCSpy = jest.spyOn(pluginC.hooks.eventA, 'handler');

    jest
      .doMock('@gasket/testa-plugin', () => pluginA, { virtual: true })
      .doMock('@gasket/testb-plugin', () => pluginB, { virtual: true })
      .doMock('@gasket/testc-plugin', () => pluginC, { virtual: true });

    const PluginEngine = require('..');
    const Resolver = require('../lib/resolver');
    jest.spyOn(Resolver.prototype, 'tryResolve').mockImplementation(arg => {
      return `${process.cwd()}/node_modules/${arg}`;
    });

    engine = new PluginEngine(mockConfig);
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('passes the gasket config to each hook', async () => {
    await engine.execMap('eventA');

    expect(hookASpy.mock.calls[0][0]).toHaveProperty('config', mockConfig);
    expect(hookBSpy.mock.calls[0][0]).toHaveProperty('config', mockConfig);
    expect(hookCSpy.mock.calls[0][0]).toHaveProperty('config', mockConfig);
  });

  it('awaits sync or async hooks and resolves a map object', async () => {
    const result = await engine.execMap('eventA');
    expect(result).toEqual({ testa: 1, testb: 2, testc: 3 });
  });

  it('resolves to an empty object if nothing hooked the event', async () => {
    const result = await engine.execMap('eventB');
    expect(result).toEqual({});
  });

  it('works when invoked without a context', async () => {
    const { execMap } = engine;

    const result = await execMap('eventA');

    expect(result).toEqual({ testa: 1, testb: 2, testc: 3 });
  });
});
