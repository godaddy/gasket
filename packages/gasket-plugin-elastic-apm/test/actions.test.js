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

  it('is an object', () => {
    expect(typeof actions).toStrictEqual('object');
  });

  it('defines getApmTransaction', () => {
    expect(actions.getApmTransaction).toBeDefined();
  });

  it('returns undefined if APM is not started', async () => {
    mockIsStarted.mockReturnValue(false);
    const result = await actions.getApmTransaction(mockGasket);
    expect(result).toBeUndefined();
  });

  it('executes the apmTransaction hook', async () => {
    await actions.getApmTransaction(mockGasket, {});
    expect(mockGasket.exec).toHaveBeenCalledWith('apmTransaction', apm.currentTransaction, { req: {} });
  });

  it('returns undefined if no transaction', async () => {
    // eslint-disable-next-line no-undefined
    apm.currentTransaction = undefined;
    const result = await actions.getApmTransaction(mockGasket);
    expect(result).toBeUndefined();
  });
});
