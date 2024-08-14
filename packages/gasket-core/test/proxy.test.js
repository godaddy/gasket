import { jest } from '@jest/globals';
import { lifecycleMethods } from '../lib/engine.js';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketProxy }  = await import('../lib/proxy.js');
const { Gasket }  = await import('../lib/gasket.js');


describe('GasketProxy', () => {
  let gasket, pluginA, pluginB;

  beforeEach(() => {
    pluginA = {
      name: 'pluginA',
      actions: {
        getActionsCount: jest.fn((_gasket) => {
          return Object.keys(_gasket.actions).length;
        }),
        getEventA: jest.fn(async (_gasket, value) => {
          return _gasket.execWaterfall('eventA', value);
        })
      },
      hooks: {
        eventA: jest.fn((_gasket, value) => {
          return value * 7;
        })
      }
    };

    pluginB = {
      name: 'pluginB',
      hooks: {
        eventA: jest.fn((_gasket, value) => {
          return value + 4;
        })
      }
    };

    gasket = new Gasket({ plugins: [pluginA, pluginB] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('can get a proxy from a gasket', () => {
    const proxy = gasket.asProxy();
    expect(proxy).toBeInstanceOf(GasketProxy);
  });

  it('can access lifecycles', () => {
    const proxy = gasket.asProxy();
    lifecycleMethods.forEach(method => {
      expect(proxy[method]).toBeInstanceOf(Function);
    });
  });

  it('can access actions', () => {
    const proxy = gasket.asProxy();
    expect(proxy.actions).toEqual({
      getActionsCount: expect.any(Function),
      getEventA: expect.any(Function)
    });
  });

  it('can access config', () => {
    const proxy = gasket.asProxy();
    expect(proxy.config).toBe(gasket.config);
  });

  it('can attach arbitrary properties', () => {
    const proxy = gasket.asProxy();
    const proxy2 = gasket.asProxy();

    // attaching in a proxy affects the original
    proxy.extra = true;
    expect(proxy.extra).toBe(true);

    // found on original
    expect(gasket.extra).toBe(true);

    // accessible in another proxy
    expect(proxy2.extra).toBe(true);

  });
});
