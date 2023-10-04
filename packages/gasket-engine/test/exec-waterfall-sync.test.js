describe('The execWaterfallSync method', () => {
  let engine, pluginA, pluginB;

  const mockConfig = {
    some: 'config'
  };

  beforeEach(() => {
    pluginA = {
      name: 'pluginA',
      hooks: {
        eventA: jest.fn((gasket, value) => {
          return value * 7;
        }),
        eventB: () => null
      }
    };

    pluginB = {
      name: 'pluginB',
      hooks: {
        eventA: jest.fn((gasket, value) => {
          return value + 4;
        }),
        eventB: () => null
      }
    };

    const { Loader } = require('@gasket/resolve');
    jest.spyOn(Loader.prototype, 'loadConfigured').mockImplementation(() => {
      return {
        plugins: [
          { module: pluginA },
          { module: pluginB }
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

  it('sequentially transforms a value', () => {
    const result = engine.execWaterfallSync('eventA', 5);
    expect(result).toEqual(39);
  });

  it('supports additional arguments', () => {
    const otherArg = { some: 'thing' };

    const result = engine.execWaterfallSync('eventA', 5, otherArg);

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(engine, 5, otherArg);
    expect(pluginB.hooks.eventA).toHaveBeenCalledWith(engine, 35, otherArg);
    expect(result).toEqual(39);
  });

  it('works when invoked without a context', () => {
    const { execWaterfallSync } = engine;

    const result = execWaterfallSync('eventA', 5);

    expect(result).toEqual(39);
  });

  it('handles the return of nullish values', () => {
    const { execWaterfallSync } = engine;

    const result = execWaterfallSync('eventB', null);

    expect(result).toEqual(null);
  });
});
