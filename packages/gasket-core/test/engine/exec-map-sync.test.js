import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketTrace }  = await import('../../lib/branch.js');
const { Gasket }  = await import('../../lib/gasket.js');

describe('The execSync method', () => {
  let gasket, pluginA, pluginB;

  beforeEach(() => {
    pluginA = {
      name: 'pluginA',
      hooks: {
        eventA: jest.fn(() => {
          return 1;
        })
      }
    };

    pluginB = {
      name: 'pluginB',
      hooks: {
        eventA: jest.fn(() => {
          return 2;
        })
      }
    };

    gasket = new Gasket({ plugins: [pluginA, pluginB] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns an map of results', () => {
    const result = gasket.execMapSync('eventA');
    expect(result).toEqual({ pluginA: 1, pluginB: 2 });
  });

  it('resolves to an empty array if nothing hooked the event', () => {
    const result = gasket.execMapSync('eventB');
    expect(result).toEqual({});
  });

  it('works when invoked without a context', () => {
    const { execMapSync } = gasket;

    const result = execMapSync('eventA');

    expect(result).toEqual({ pluginA: 1, pluginB: 2 });
  });

  it('invokes hooks with isolate', () => {
    gasket.execMapSync('eventA');

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.any(GasketTrace));
  });

  it('branch isolate passed through', () => {
    const spy = jest.spyOn(gasket.engine, 'execMapSync');
    const branch = gasket.traceBranch();
    const result = branch.execMapSync('eventA');

    expect(spy).toHaveBeenCalledWith(expect.traceProxyOf(branch), 'eventA');
    expect(result).toEqual({ pluginA: 1, pluginB: 2 });
  });

  it('has expected trace output', () => {
    mockDebug.mockClear();
    gasket.execMapSync('eventA', 5);

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root'],
      ['  ◆ execMapSync(eventA)'],
      ['  ↪ pluginA:eventA'],
      ['  ↪ pluginB:eventA']
    ]);
  });
});
