const actions = require('../lib/actions');
const mockIsStarted = jest.fn();

jest.mock('elastic-apm-node', () => ({
  isStarted: mockIsStarted,
  currentTransaction: {
    name: 'GET /cohorts/:cohortId'
  }
}));

describe('actions', () => {
  let mockGasket, apm;

  beforeEach(() => {
    apm = require('elastic-apm-node');
    mockIsStarted.mockReturnValue(true);
    mockGasket = {
      exec: jest.fn()
    };
  });

  it('is a function', () => {
    expect(typeof actions).toStrictEqual('function');
  });

  it('returns an object', () => {
    expect(typeof actions(mockGasket)).toStrictEqual('object');
  });

  it('defines getApmTransaction', () => {
    expect(actions(mockGasket).getApmTransaction).toBeDefined();
  });

  it('returns undefined if APM is not started', async () => {
    mockIsStarted.mockReturnValue(false);
    const result = await actions(mockGasket).getApmTransaction();
    expect(result).toBeUndefined();
  });

  it('executes the apmTransaction hook', async () => {
    await actions(mockGasket).getApmTransaction({});
    expect(mockGasket.exec).toHaveBeenCalledWith('apmTransaction', apm.currentTransaction, { req: {} });
  });

  it('returns undefined if no transaction', async () => {
    // eslint-disable-next-line no-undefined
    apm.currentTransaction = undefined;
    const result = await actions(mockGasket).getApmTransaction();
    expect(result).toBeUndefined();
  });
});
