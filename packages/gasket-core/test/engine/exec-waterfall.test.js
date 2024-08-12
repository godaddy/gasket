import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketEngine, GasketEngineDriver }  = await import('../../lib/engine.js');

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
    jest.clearAllMocks();
  });

  it('sequentially transforms a value', async () => {
    const result = await engine.execWaterfall('eventA', 5);
    expect(result).toEqual(39);
  });

  it('works when invoked without a context', async () => {
    const { execWaterfall } = engine;

    const result = await execWaterfall('eventA', 5);

    expect(result).toEqual(39);
  });

  it('invokes hooks with driver', async () => {
    const result = await engine.execWaterfall('eventA', 5);

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.any(GasketEngineDriver), 5);
    expect(result).toEqual(39);
  });

  it('driver passed through', async () => {
    const spy = jest.spyOn(engine._nucleus, 'execWaterfall');
    const driver = engine.withDriver();

    const result = await driver.execWaterfall('eventA', 5);
    expect(spy).toHaveBeenCalledWith(driver, 'eventA', 5);
    expect(result).toEqual(39);
  });

  it('supports additional arguments', async () => {
    const otherArg = { some: 'thing' };

    const driver = engine.withDriver();
    const result = await driver.execWaterfall('eventA', 5, otherArg);

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(driver, 5, otherArg);
    expect(pluginB.hooks.eventA).toHaveBeenCalledWith(driver, 35, otherArg);
    expect(result).toEqual(39);
  });

  it('has expected trace output', async () => {
    await engine.execWaterfall('eventA', 5);

    expect(mockDebug.mock.calls).toEqual([
      ['[0]  ◇ execWaterfall(eventA)'],
      ['[0]  ↪ pluginA:eventA'],
      ['[0]  ↪ pluginB:eventA']
    ]);
  });
});
