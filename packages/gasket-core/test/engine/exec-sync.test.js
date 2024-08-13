import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketProxy }  = await import('../../lib/proxy.js');
const { Gasket }  = await import('../../lib/gasket.js');

describe('The execSync method', () => {
  let gasket, pluginA, pluginB;

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

    gasket = new Gasket({ plugins: [pluginA, pluginB] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns an Array of results', () => {
    const result = gasket.execSync('eventA', 0);
    expect(result).toEqual([1, 2]);
  });

  it('resolves to an empty array if nothing hooked the event', () => {
    const result = gasket.execSync('eventB', 0);
    expect(result).toEqual([]);
  });

  it('works when invoked without a context', () => {
    const { execSync } = gasket;

    const result = execSync('eventA', 0);

    expect(result).toEqual([1, 2]);
  });

  it('invokes hooks with driver', () => {
    gasket.execSync('eventA', 5);

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.any(GasketProxy), 5);
  });

  it('driver passed through', () => {
    const spy = jest.spyOn(gasket.engine, 'execSync');
    const proxy = gasket.asProxy();
    const result = proxy.execSync('eventA', 5);

    expect(spy).toHaveBeenCalledWith(proxy, 'eventA', 5);
    expect(result).toEqual([6, 7]);
  });

  it('has expected trace output', () => {
    mockDebug.mockClear();
    gasket.execSync('eventA', 5);

    expect(mockDebug.mock.calls).toEqual([
      ['[2]  ◆ execSync(eventA)'],
      ['[2]  ↪ pluginA:eventA'],
      ['[2]  ↪ pluginB:eventA']
    ]);
  });
});
