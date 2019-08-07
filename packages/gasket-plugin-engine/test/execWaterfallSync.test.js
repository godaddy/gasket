describe('The execWaterfallSync method', () => {
  let engine, pluginA, pluginB;

  beforeEach(() => {
    pluginA = {
      hooks: {
        eventA: jest.fn((gasket, value) => {
          return value * 7;
        })
      }
    };

    pluginB = {
      hooks: {
        eventA: jest.fn((gasket, value) => {
          return value + 4;
        })
      }
    };

    jest.resetModules();

    jest
      .doMock('@gasket/testa-plugin', () => pluginA, { virtual: true })
      .doMock('@gasket/testb-plugin', () => pluginB, { virtual: true });

    const PluginEngine = require('..');
    jest.spyOn(PluginEngine.prototype, '_resolveModulePath').mockImplementation(arg => {
      return `/root/node_modules/${arg}`;
    });

    engine = new PluginEngine({
      plugins: {
        add: ['testa', 'testb']
      }
    });
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
});
