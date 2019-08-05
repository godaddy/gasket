describe('The execMap method', () => {
  let engine, hookASpy, hookBSpy, hookCSpy;

  const mockConfig = {
    some: 'config',
    plugins: {
      add: ['a', 'b', 'c']
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
        timing: { after: ['a'] },
        handler: () => 3
      }
    }
  };

  beforeEach(() => {
    hookASpy = jest.spyOn(pluginA.hooks, 'eventA');
    hookBSpy = jest.spyOn(pluginB.hooks, 'eventA');
    hookCSpy = jest.spyOn(pluginC.hooks.eventA, 'handler');

    jest
      .doMock('@gasket/a-plugin', () => pluginA, { virtual: true })
      .doMock('@gasket/b-plugin', () => pluginB, { virtual: true })
      .doMock('@gasket/c-plugin', () => pluginC, { virtual: true });

    const PluginEngine = require('..');
    jest.spyOn(PluginEngine.prototype, '_resolveModulePath').mockImplementation(arg => {
      return `/root/node_modules/${arg}`;
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
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('resolves to an empty object if nothing hooked the event', async () => {
    const result = await engine.execMap('eventB');
    expect(result).toEqual({});
  });

  it('works when invoked without a context', async () => {
    const { execMap } = engine;

    const result = await execMap('eventA');

    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });
});
