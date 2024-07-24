const actions = require('../lib/actions');

describe('actions', () => {
  let mockGasket;

  beforeEach(() => {
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
    mockGasket.apm = { isStarted: jest.fn().mockReturnValue(false) };
    const result = await actions(mockGasket).getApmTransaction();
    expect(result).toBeUndefined();
  });

  it('returns undefined if no transaction', async () => {
    mockGasket.apm = { isStarted: jest.fn().mockReturnValue(true), currentTransaction: null };
    const result = await actions(mockGasket).getApmTransaction();
    expect(result).toBeUndefined();
  });

  it('executes the apmTransaction hook', async () => {
    const transaction = {};
    mockGasket.apm = { isStarted: jest.fn().mockReturnValue(true), currentTransaction: transaction };
    await actions(mockGasket).getApmTransaction({});
    expect(mockGasket.exec).toHaveBeenCalledWith('apmTransaction', transaction, { req: {} });
  });
});
