describe('The exec method', () => {
  let engine, hookASpy, hookBSpy;

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

  beforeEach(() => {
    hookASpy = jest.spyOn(pluginA.hooks, 'eventA');
    hookBSpy = jest.spyOn(pluginB.hooks, 'eventA');

    const { Loader } = require('@gasket/resolve');
    jest.spyOn(Loader.prototype, 'loadConfigured').mockImplementation(() => {
      return {
        plugins: [
          { module: pluginA },
          { module: pluginB }
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
    await engine.exec('eventA');

    expect(hookASpy.mock.calls[0][0]).toHaveProperty('config', mockConfig);
    expect(hookBSpy.mock.calls[0][0]).toHaveProperty('config', mockConfig);
  });

  it('awaits sync or async hooks and resolves an Array', async () => {
    const result = await engine.exec('eventA');
    expect(result).toEqual([1, 2]);
  });

  it('resolves to an empty array if nothing hooked the event', async () => {
    const result = await engine.exec('eventB');
    expect(result).toEqual([]);
  });

  it('works when invoked without a context', async () => {
    const { exec } = engine;

    const result = await exec('eventA');

    expect(result).toEqual([1, 2]);
  });
});
