describe('The execWaterfall method', () => {
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

    jest
      .doMock('@gasket/testa-plugin', () => pluginA, { virtual: true })
      .doMock('@gasket/testb-plugin', () => pluginB, { virtual: true });

    const PluginEngine = require('..');
    const Resolver = require('../lib/resolver');
    jest.spyOn(Resolver.prototype, 'tryResolve').mockImplementation(arg => {
      return `${process.cwd()}/node_modules/${arg}`;
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

  it('sequentially transforms a value', async () => {
    const result = await engine.execWaterfall('eventA', 5);
    expect(result).toEqual(39);
  });

  it('supports additional arguments', async () => {
    const otherArg = { some: 'thing' };

    const result = await engine.execWaterfall('eventA', 5, otherArg);

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(engine, 5, otherArg);
    expect(pluginB.hooks.eventA).toHaveBeenCalledWith(engine, 35, otherArg);
    expect(result).toEqual(39);
  });

  it('works when invoked without a context', async () => {
    const { execWaterfall } = engine;

    const result = await execWaterfall('eventA', 5);

    expect(result).toEqual(39);
  });
});
