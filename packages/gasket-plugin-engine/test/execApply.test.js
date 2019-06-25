describe('The execApply method', () => {
  let engine, hookASpy, hookBSpy, hookCSpy;

  const Wrapper = class Wrapper {
    constructor(plugin) {
      this.plugin = plugin;
    }
  };

  const mockConfig = {
    some: 'config',
    plugins: {
      add: ['a', 'b', 'c']
    }
  };

  const pluginA = {
    name: 'a',
    hooks: {
      eventA(eng, arg, lit) {
        return Promise.resolve({ arg, lit });
      }
    }
  };

  const pluginB = {
    name: 'b',
    hooks: {
      eventA(eng, arg) {
        return arg;
      }
    }
  };

  const pluginC = {
    name: 'c',
    hooks: {
      eventA: {
        timing: { after: ['a'] },
        handler: (eng, arg) => arg
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

    engine = new PluginEngine(mockConfig);
  });

  it('passes the gasket config to each hook', async () => {
    await engine.execApply('eventA', async (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(hookASpy.mock.calls[0][0]).toHaveProperty('config', mockConfig);
    expect(hookBSpy.mock.calls[0][0]).toHaveProperty('config', mockConfig);
    expect(hookCSpy.mock.calls[0][0]).toHaveProperty('config', mockConfig);
  });

  it('awaits sync or async hooks and resolves an Array', async () => {
    const result = await engine.execApply('eventA', async (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toEqual(pluginA);
    expect(result[1].plugin).toEqual(pluginB);
    expect(result[2].plugin).toEqual(pluginC);
  });

  it('accepts thunks and literal argument values when resolving an Array', async () => {
    const result = await engine.execApply('eventA', async (plugin, handler) => {
      return handler(new Wrapper(plugin), 'literal');
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toEqual(pluginA);
    expect(result[0].lit).toEqual('literal');
    expect(result[1].plugin).toEqual(pluginB);
    expect(result[2].plugin).toEqual(pluginC);
  });

  it('resolves to an empty array if nothing hooked the event', async () => {
    const result = await engine.execApply('eventB', async (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toEqual([]);
  });

  it('works when invoked without a context', async () => {
    const { execApply } = engine;

    const result = await execApply('eventA', async (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toEqual(pluginA);
    expect(result[1].plugin).toEqual(pluginB);
    expect(result[2].plugin).toEqual(pluginC);
  });
});
