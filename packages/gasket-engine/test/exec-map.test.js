describe('The execMap method', () => {
  let engine, hookASpy, hookBSpy, hookCSpy;

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

    const GasketEngine = require('..');
    engine = new GasketEngine([pluginA, pluginB, pluginC]);
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('passes the gasket config to each hook', async () => {
    await engine.execMap('eventA');

    expect(hookASpy).toHaveBeenCalledWith(engine);
    expect(hookBSpy).toHaveBeenCalledWith(engine);
    expect(hookCSpy).toHaveBeenCalledWith(engine);
  });

  it('awaits sync or async hooks and resolves a map object', async () => {
    const result = await engine.execMap('eventA');
    expect(result).toEqual({ pluginA: 1, pluginB: 2, pluginC: 3 });
  });

  it('resolves to an empty object if nothing hooked the event', async () => {
    const result = await engine.execMap('eventB');
    expect(result).toEqual({});
  });

  it('works when invoked without a context', async () => {
    const { execMap } = engine;

    const result = await execMap('eventA');

    expect(result).toEqual({ pluginA: 1, pluginB: 2, pluginC: 3 });
  });
});
