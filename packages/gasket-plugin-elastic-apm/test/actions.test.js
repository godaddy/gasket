import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as actions from '../lib/actions.js';

const mockIsStarted = vi.fn();
const mockCurrentTransaction = {
  name: 'GET /cohorts/:cohortId'
};

const mockApm = {
  isStarted: mockIsStarted,
  currentTransaction: mockCurrentTransaction
};

vi.mock('elastic-apm-node', () => ({
  default: mockApm
}));

describe('actions', () => {
  let mockGasket, mockReq;

  beforeEach(() => {
    mockIsStarted.mockReturnValue(true);
    mockApm.currentTransaction = mockCurrentTransaction;
    mockGasket = {
      exec: vi.fn()
    };
    mockReq = {
      headers: {}
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
    const result = await actions.getApmTransaction(mockGasket, mockReq);
    expect(result).toBeUndefined();
  });

  it('executes the apmTransaction hook', async () => {
    await actions.getApmTransaction(mockGasket, mockReq);
    expect(mockGasket.exec).toHaveBeenCalledWith(
      'apmTransaction',
      mockApm.currentTransaction,
      { req: expect.objectContaining(mockReq) }
    );
  });

  it('only executes the apmTransaction lifecycle once per request', async () => {
    await actions.getApmTransaction(mockGasket, mockReq);
    await actions.getApmTransaction(mockGasket, mockReq);
    expect(mockGasket.exec).toHaveBeenCalledTimes(1);

    const anotherReq = { ...mockReq, headers: {} };
    await actions.getApmTransaction(mockGasket, anotherReq);
    await actions.getApmTransaction(mockGasket, anotherReq);
    expect(mockGasket.exec).toHaveBeenCalledTimes(2);
  });

  it('returns undefined if no transaction', async () => {
    // eslint-disable-next-line no-undefined
    mockApm.currentTransaction = undefined;
    const result = await actions.getApmTransaction(mockGasket, mockReq);
    expect(result).toBeUndefined();
  });
});
