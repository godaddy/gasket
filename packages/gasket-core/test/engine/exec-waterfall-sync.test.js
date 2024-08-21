import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketIsolate }  = await import('../../lib/branch.js');
const { Gasket }  = await import('../../lib/gasket.js');

describe('The execWaterfallSync method', () => {
  let gasket, pluginA, pluginB;

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

    gasket = new Gasket({ plugins: [pluginA, pluginB] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sequentially transforms a value', () => {
    const result = gasket.execWaterfallSync('eventA', 5);
    expect(result).toEqual(39);
  });

  it('works when invoked without a context', () => {
    const { execWaterfallSync } = gasket;

    const result = execWaterfallSync('eventA', 5);

    expect(result).toEqual(39);
  });

  it('invokes hooks with isolate', () => {
    gasket.execWaterfallSync('eventA', 5);

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.any(GasketIsolate), 5);
  });

  it('branch isolate passed through', () => {
    const spy = jest.spyOn(gasket.engine, 'execWaterfallSync');
    const branch = gasket.branch();
    const result = branch.execWaterfallSync('eventA', 5);

    expect(spy).toHaveBeenCalledWith(expect.isolateOf(branch), 'eventA', 5);
    expect(result).toEqual(39);
  });

  it('supports additional arguments', () => {
    const otherArg = { some: 'thing' };

    const branch = gasket.branch();
    const result = branch.execWaterfallSync('eventA', 5, otherArg);

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.isolateOf(branch), 5, otherArg);
    expect(pluginB.hooks.eventA).toHaveBeenCalledWith(expect.isolateOf(branch), 35, otherArg);
    expect(result).toEqual(39);
  });

  it('has expected trace output', () => {
    mockDebug.mockClear();

    gasket.execWaterfallSync('eventA', 5);

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root'],
      ['  ◆ execWaterfallSync(eventA)'],
      ['  ↪ pluginA:eventA'],
      ['  ↪ pluginB:eventA']
    ]);
  });

  it('handles the return of nullish values', () => {
    const { execWaterfallSync } = gasket;

    const result = execWaterfallSync('eventB', null);

    expect(result).toEqual(null);
  });
});
