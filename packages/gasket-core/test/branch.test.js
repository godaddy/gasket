import { jest } from '@jest/globals';
import { lifecycleMethods } from '../lib/engine.js';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketBranch } = await import('../lib/branch.js');
const { Gasket } = await import('../lib/gasket.js');


describe('GasketBranch', () => {
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
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    GasketBranch._nextBranchId = 0;
  });

  it('can get a branch from a gasket', () => {
    const branch = gasket.branch();
    expect(branch).toBeInstanceOf(GasketBranch);

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root']
    ]);
  });

  it('can get a branch from a branch', () => {
    const branch = gasket.branch();
    const subBranch = branch.branch();
    const subBranch2 = subBranch.branch();
    const subBranch3 = subBranch2.branch();
    expect(subBranch3).toBeInstanceOf(GasketBranch);

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root'],
      ['⋌ 3'],
      ['⋌ 4'],
      ['⋌ 5']
    ]);
  });

  it('can access lifecycles', () => {
    const branch = gasket.branch();
    lifecycleMethods.forEach(method => {
      expect(branch[method]).toBeInstanceOf(Function);
    });
  });

  it('can access actions', () => {
    const branch = gasket.branch();
    expect(branch.actions).toEqual({
      getActionsCount: expect.any(Function),
      getEventA: expect.any(Function)
    });
  });

  it('can access config', () => {
    const branch = gasket.branch();
    expect(branch.config).toBe(gasket.config);
  });

  it('can attach arbitrary properties', () => {
    const branch = gasket.branch();
    const branch2 = gasket.branch();

    // attaching in a branch affects the original
    branch.extra = true;
    expect(branch.extra).toBe(true);

    // found on original
    expect(gasket.extra).toBe(true);

    // accessible in another branch
    expect(branch2.extra).toBe(true);

    // accessible in subbranch
    expect(branch2.branch().extra).toBe(true);
  });
});
