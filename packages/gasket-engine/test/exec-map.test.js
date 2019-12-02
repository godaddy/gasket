describe('The execMap method', () => {
  let engine, hookASpy, hookBSpy, hookCSpy;

  const mockConfig = {
    some: 'config'
  };

  const pluginA = {
    name: 'pluginA',
    hooks: {
      eventA() {
        return Promise.resolve(1);
      }
    }
  };

  const pluginB = {
    name: 'pluginB',
    hooks: {
      eventA() {
        return 2;
      }
    }
  };

  const pluginC = {
    name: 'pluginC',
    hooks: {
      eventA: {
        timing: { after: ['pluginA'] },
        handler: () => 3
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

    const PluginEngine = require('..');
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
    expect(result).toEqual({ 'gasket-plugin-pluginA': 1, 'gasket-plugin-pluginB': 2, 'gasket-plugin-pluginC': 3 });
  });

  it('resolves to an empty object if nothing hooked the event', async () => {
    const result = await engine.execMap('eventB');
    expect(result).toEqual({});
  });

  it('works when invoked without a context', async () => {
    const { execMap } = engine;

    const result = await execMap('eventA');

    expect(result).toEqual({ 'gasket-plugin-pluginA': 1, 'gasket-plugin-pluginB': 2, 'gasket-plugin-pluginC': 3 });
  });
});
