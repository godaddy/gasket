import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketBranch }  = await import('../../lib/branch.js');
const { Gasket }  = await import('../../lib/gasket.js');

describe('The execWaterfall method', () => {
  let gasket, pluginA, pluginB;

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

    gasket = new Gasket({ plugins: [pluginA, pluginB] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sequentially transforms a value', async () => {
    const result = await gasket.execWaterfall('eventA', 5);
    expect(result).toEqual(39);
  });

  it('works when invoked without a context', async () => {
    const { execWaterfall } = gasket;

    const result = await execWaterfall('eventA', 5);

    expect(result).toEqual(39);
  });

  it('invokes hooks with driver', async () => {
    const result = await gasket.execWaterfall('eventA', 5);

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.any(GasketBranch), 5);
    expect(result).toEqual(39);
  });

  it('driver passed through', async () => {
    const spy = jest.spyOn(gasket.engine, 'execWaterfall');
    const branch = gasket.branch();

    const result = await branch.execWaterfall('eventA', 5);
    expect(spy).toHaveBeenCalledWith(branch, 'eventA', 5);
    expect(result).toEqual(39);
  });

  it('supports additional arguments', async () => {
    const otherArg = { some: 'thing' };

    const branch = gasket.branch();
    const result = await branch.execWaterfall('eventA', 5, otherArg);

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(branch, 5, otherArg);
    expect(pluginB.hooks.eventA).toHaveBeenCalledWith(branch, 35, otherArg);
    expect(result).toEqual(39);
  });

  it('has expected trace output', async () => {
    mockDebug.mockClear();
    await gasket.execWaterfall('eventA', 5);

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root'],
      ['  ◇ execWaterfall(eventA)'],
      ['  ↪ pluginA:eventA'],
      ['  ↪ pluginB:eventA']
    ]);
  });
});
