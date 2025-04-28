import { jest, describe } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketTrace } = await import('../../lib/trace.js');
const { Gasket } = await import('../../lib/gasket.js');

async function pause(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

describe('The exec method', () => {
  let gasket, hookASpy;

  const pluginA = {
    name: 'pluginA',
    hooks: {
      eventA() {
        return Promise.resolve(1);
      },
      eventB: {
        timing: {
          after: ['pluginB']
        },
        async handler() {
          const start = Date.now();
          await pause(10);
          return {
            value: 'A',
            start,
            end: Date.now()
          };
        }
      },
      eventC: {
        timing: {
          first: true
        },
        async handler() {
          const start = Date.now();
          await pause(10);
          return {
            value: 'A',
            start,
            end: Date.now()
          };
        }
      }
    }
  };

  const pluginB = {
    name: 'pluginB',
    hooks: {
      eventA() {
        return 2;
      },
      async eventB() {
        const start = Date.now();
        await pause(10);
        return {
          value: 'B',
          start,
          end: Date.now()
        };
      },
      eventC: {
        timing: {
          first: true,
          before: ['pluginA']
        },
        async handler() {
          const start = Date.now();
          await pause(10);
          return {
            value: 'B',
            start,
            end: Date.now()
          };
        }
      }
    }
  };

  beforeEach(() => {
    hookASpy = jest.spyOn(pluginA.hooks, 'eventA');

    gasket = new Gasket({ plugins: [pluginA, pluginB] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('awaits sync or async hooks and resolves an Array', async () => {
    const result = await gasket.exec('eventA');
    expect(result).toEqual([1, 2]);
  });

  it('resolves to an empty array if nothing hooked the event', async () => {
    const result = await gasket.exec('eventMissing');
    expect(result).toEqual([]);
  });

  it('works when invoked without a context', async () => {
    const { exec } = gasket;

    const result = await exec('eventA');

    expect(result).toEqual([1, 2]);
  });

  it('invokes hooks with isolate', async () => {
    await gasket.exec('eventA');

    expect(hookASpy).toHaveBeenCalledWith(expect.any(GasketTrace));
  });

  it('branch isolate passed through', async () => {
    const spy = jest.spyOn(gasket.engine, 'exec');
    const branch = gasket.traceBranch();

    const result = await branch.exec('eventA');
    expect(spy).toHaveBeenCalledWith(expect.traceProxyOf(branch), 'eventA');
    expect(result).toEqual([1, 2]);
  });

  it('does not cause unhandled rejections on thrown errors', async () => {
    gasket.hook({
      event: 'mock',
      async handler() {
        throw new Error('I am rejecting you');
      }
    });

    await expect(gasket.exec('mock')).rejects.toThrow(Error);
  });

  it('should await if ordered', async () => {
    const result = await gasket.exec('eventB');

    expect(result).toEqual([
      expect.objectContaining({ value: 'B' }),
      expect.objectContaining({ value: 'A' })
    ]);

    const [resultsB, resultsA] = result;
    expect(resultsA.start).toBeGreaterThanOrEqual(resultsB.end);
  });

  it('should await if ordered within first grouping', async () => {
    const result = await gasket.exec('eventC');

    expect(result).toEqual([
      expect.objectContaining({ value: 'B' }),
      expect.objectContaining({ value: 'A' })
    ]);

    const [resultsB, resultsA] = result;
    expect(resultsA.start).toBeGreaterThanOrEqual(resultsB.end);
  });

  it('has expected trace output', async () => {
    mockDebug.mockClear();
    await gasket.exec('eventA');

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root'],
      ['  ◇ exec(eventA)'],
      ['  ↪ pluginA:eventA'],
      ['  ↪ pluginB:eventA']
    ]);
  });
});
