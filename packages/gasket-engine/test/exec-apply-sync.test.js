describe('The execApplySync method', () => {
  let engine, hookASpy, hookBSpy, hookCSpy;

  const Wrapper = class Wrapper {
    constructor(plugin) {
      this.plugin = plugin;
    }
  };

  const mockConfig = {
    some: 'config'
  };

  const pluginA = {
    name: 'pluginA',
    hooks: {
      eventA(eng, arg, lit) {
        return { arg, lit };
      }
    }
  };

  const pluginB = {
    name: 'pluginB',
    hooks: {
      eventA(eng, arg) {
        return arg;
      }
    }
  };

  const pluginC = {
    name: 'pluginC',
    hooks: {
      eventA: {
        timing: { after: ['pluginA'] },
        handler: (eng, arg) => arg
      }
    }
  };

  beforeEach(() => {
    hookASpy = jest.spyOn(pluginA.hooks, 'eventA');
    hookBSpy = jest.spyOn(pluginB.hooks, 'eventA');
    hookCSpy = jest.spyOn(pluginC.hooks.eventA, 'handler');

    const { Loader } = require('@gasket/resolve');
    jest.spyOn(Loader.prototype, 'loadConfigured').mockImplementation(() => {
      return {
        plugins: [
          { module: pluginA },
          { module: pluginB },
          { module: pluginC }
        ]
      };
    });

    const PluginEngine = require('../lib/engine');
    engine = new PluginEngine(mockConfig);
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('passes the gasket config to each hook', async () => {
    await engine.execApply('eventA', (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(hookASpy.mock.calls[0][0]).toHaveProperty('config', mockConfig);
    expect(hookBSpy.mock.calls[0][0]).toHaveProperty('config', mockConfig);
    expect(hookCSpy.mock.calls[0][0]).toHaveProperty('config', mockConfig);
  });

  it('returns an Array of results', async () => {
    const result = engine.execApplySync('eventA', (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toEqual(pluginA);
    expect(result[1].plugin).toEqual(pluginB);
    expect(result[2].plugin).toEqual(pluginC);
  });

  it('accepts thunks and literal argument values when resolving an Array', async () => {
    const result = engine.execApplySync('eventA', (plugin, handler) => {
      return handler(new Wrapper(plugin), 'literal');
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toEqual(pluginA);
    expect(result[0].lit).toEqual('literal');
    expect(result[1].plugin).toEqual(pluginB);
    expect(result[2].plugin).toEqual(pluginC);
  });

  it('resolves to an empty array if nothing hooked the event', async () => {
    const result = engine.execApplySync('eventB', (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toEqual([]);
  });

  it('works when invoked without a context', async () => {
    const { execApplySync } = engine;

    const result = execApplySync('eventA', (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toEqual(pluginA);
    expect(result[1].plugin).toEqual(pluginB);
    expect(result[2].plugin).toEqual(pluginC);
  });
});
