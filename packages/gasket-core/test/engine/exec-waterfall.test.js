import { GasketEngine } from '../../lib/index.js';

describe('The execWaterfall method', () => {
  let engine, pluginA, pluginB;

  beforeEach(() => {
    pluginA = {
      name: 'pluginA',
      hooks: {
        eventA: jest.fn((gasket, value) => {
          return value * 7;
        })
      }
    };

    pluginB = {
      name: 'pluginB',
      hooks: {
        eventA: jest.fn((gasket, value) => {
          return value + 4;
        })
      }
    };

    engine = new GasketEngine([pluginA, pluginB]);
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

  it('works with a driver', async () => {
    const otherArg = { some: 'thing' };

    // const driver = {
    //   id: 134,
    //   trace: {
    //     _plugin: plugin => console.log('plugin', plugin),
    //     _lifecycle: (type, event) => console.log('eventName', type, event)
    //   },
    //   execWaterfall(event, value, ...args) {
    //     return engine.execWaterfall(event, value, ...args);
    //   }
    // };

    const spy = jest.spyOn(engine, '_execWaterfall');

    // const result = await engine.withDriver().execWaterfall('eventA', 5, otherArg);
    const driver = engine.withProxyDriver();

    const result = await driver.execWaterfall('eventA', 5, otherArg);
    expect(spy).toHaveBeenCalledWith(driver, 'eventA', 5, otherArg);

    // expect(pluginA.hooks.eventA).toHaveBeenCalledWith(engine, 5, otherArg);
    // expect(pluginB.hooks.eventA).toHaveBeenCalledWith(engine, 35, otherArg);
    expect(result).toEqual(39);
  });

  it('works when invoked without a context', async () => {
    const { execWaterfall } = engine;

    const result = await execWaterfall('eventA', 5);

    expect(result).toEqual(39);
  });
});
