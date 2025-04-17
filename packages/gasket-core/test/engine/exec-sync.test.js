import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketTrace }  = await import('../../lib/trace.js');
const { Gasket }  = await import('../../lib/gasket.js');

describe('The execSync method', () => {
  let mockGasket, pluginA, pluginB;

  beforeEach(() => {
    pluginA = {
      name: 'pluginA',
      hooks: {
        eventA: jest.fn((gasket, value) => {
          return value + 1;
        })
      }
    };

    pluginB = {
      name: 'pluginB',
      hooks: {
        eventA: jest.fn((gasket, value) => {
          return value + 2;
        })
      }
    };

    mockGasket = new Gasket({ plugins: [pluginA, pluginB] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns an Array of results', () => {
    const result = mockGasket.execSync('eventA', 0);
    expect(result).toEqual([1, 2]);
  });

  it('resolves to an empty array if nothing hooked the event', () => {
    const result = mockGasket.execSync('eventB', 0);
    expect(result).toEqual([]);
  });

  it('works when invoked without a context', () => {
    const { execSync } = mockGasket;

    const result = execSync('eventA', 0);

    expect(result).toEqual([1, 2]);
  });

  it('invokes hooks with isolate', () => {
    mockGasket.execSync('eventA', 5);

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.any(GasketTrace), 5);
  });

  it('branch isolate passed through', () => {
    const spy = jest.spyOn(mockGasket.engine, 'execSync');
    const branch = mockGasket.traceBranch();
    const result = branch.execSync('eventA', 5);

    expect(spy).toHaveBeenCalledWith(expect.traceProxyOf(branch), 'eventA', 5);
    expect(result).toEqual([6, 7]);
  });

  it('has expected trace output', () => {
    mockDebug.mockClear();
    mockGasket.execSync('eventA', 5);

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root'],
      ['  ◆ execSync(eventA)'],
      ['  ↪ pluginA:eventA'],
      ['  ↪ pluginB:eventA']
    ]);
  });

  it('throws for async hooks', () => {
    const pluginBad = {
      name: 'pluginBad',
      hooks: {
        async eventA(gasket, value) {
          return value * 10;
        }
      }
    };
    mockGasket = new Gasket({ plugins: [pluginA, pluginB, pluginBad] });
    expect(() => mockGasket.execSync('eventA', 5)).toThrow(
      'execSync cannot be used with async hook (eventA) of plugin (pluginBad)'
    );
  });
});
