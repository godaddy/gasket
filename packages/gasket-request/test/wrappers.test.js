import { jest, expect } from '@jest/globals';

import { withGasketRequestCache, withGasketRequest } from '../lib/wrappers.js';
import { GasketRequest, makeGasketRequest } from '../lib/request.js';

const valueA = Symbol('A');
const valueB = Symbol('B');
const valueC = Symbol('C');
const valueD = Symbol('D');

describe('withGasketRequestCache', () => {
  let gasket, actionFn;

  beforeEach(() => {
    gasket = {};
    actionFn = jest.fn()
      .mockResolvedValueOnce(valueA)
      .mockResolvedValueOnce(valueB);
  });

  it('calls actionFn with normalized request', async () => {
    const req = { headers: {} };
    const normalizeReq = await makeGasketRequest(req);

    const wrappedFn = withGasketRequestCache(actionFn);
    const result1 = await wrappedFn(gasket, req);

    expect(result1).toBe(valueA);
    expect(actionFn).toHaveBeenCalledWith(gasket, normalizeReq);
  });

  it('handles additional arguments', async () => {
    const req = { headers: {} };
    const arg1 = 'arg1';
    const arg2 = 'arg2';

    const wrappedFn = withGasketRequestCache(actionFn);
    const result = await wrappedFn(gasket, req, arg1, arg2);

    expect(result).toBe(valueA);
    expect(actionFn).toHaveBeenCalledWith(gasket, expect.any(GasketRequest), arg1, arg2);
  });

  it('returns cached result for the same request', async () => {
    const req = { headers: {} };

    const wrappedFn = withGasketRequestCache(actionFn);
    const result1 = await wrappedFn(gasket, req);
    const result2 = await wrappedFn(gasket, req);

    expect(result1).toBe(valueA);
    expect(result2).toBe(valueA);
    expect(actionFn).toHaveBeenCalledTimes(1);
  });

  it('handles parallel executions', async () => {
    const req = { headers: {} };

    const wrappedFn = withGasketRequestCache(actionFn);
    const promise1 = wrappedFn(gasket, req);
    const promise2 = wrappedFn(gasket, req);

    expect(promise1).toBeInstanceOf(Promise);
    expect(promise2).toBeInstanceOf(Promise);

    const result1 = await promise1;
    const result2 = await promise2;

    expect(result1).toBe(result2);
    expect(actionFn).toHaveBeenCalledTimes(1);
  });

  it('calls actionFn for different requests', async () => {
    const req1 = { headers: {} };
    const req2 = { headers: {} };

    const wrappedFn = withGasketRequestCache(actionFn);
    const result1 = await wrappedFn(gasket, req1);
    const result2 = await wrappedFn(gasket, req2);

    expect(result1).toBe(valueA);
    expect(result2).toBe(valueB);
    expect(actionFn).toHaveBeenCalledTimes(2);
  });

  it('distinct cached for each wrapped function', async () => {
    const req = { headers: {} };

    const actionFn2 = jest.fn()
      .mockResolvedValueOnce(valueC)
      .mockResolvedValueOnce(valueD);

    const wrappedFn = withGasketRequestCache(actionFn);
    const wrappedFn2 = withGasketRequestCache(actionFn2);

    const result1 = await wrappedFn(gasket, req);
    const result2 = await wrappedFn2(gasket, req);

    // repeated calls
    const result3 = await wrappedFn(gasket, req);
    const result4 = await wrappedFn2(gasket, req);

    expect(result1).toBe(valueA);
    expect(result2).toBe(valueC);
    expect(result3).toBe(valueA);
    expect(result4).toBe(valueC);
    expect(actionFn).toHaveBeenCalledTimes(1);
    expect(actionFn2).toHaveBeenCalledTimes(1);
  });
});

describe('withGasketRequest', () => {
  let gasket, actionFn;

  beforeEach(() => {
    gasket = {};
    actionFn = jest.fn()
      .mockResolvedValueOnce(valueA)
      .mockResolvedValueOnce(valueB);
  });

  it('calls actionFn with normalized request', async () => {
    const req = { headers: {} };
    const normalizeReq = await makeGasketRequest(req);

    const wrappedFn = withGasketRequest(actionFn);
    const result = await wrappedFn(gasket, req);

    expect(result).toBe(valueA);
    expect(actionFn).toHaveBeenCalledWith(gasket, normalizeReq);
  });

  it('handles additional arguments', async () => {
    const req = { headers: {} };
    const arg1 = 'arg1';
    const arg2 = 'arg2';

    const wrappedFn = withGasketRequest(actionFn);
    const result = await wrappedFn(gasket, req, arg1, arg2);

    expect(result).toBe(valueA);
    expect(actionFn).toHaveBeenCalledWith(gasket, expect.any(GasketRequest), arg1, arg2);
  });

  it('does not cached result for the same request', async () => {
    const req = { headers: {} };

    const wrappedFn = withGasketRequest(actionFn);
    const result1 = await wrappedFn(gasket, req);
    const result2 = await wrappedFn(gasket, req);

    expect(result1).toBe(valueA);
    expect(result2).toBe(valueB);
    expect(actionFn).toHaveBeenCalledTimes(2);
  });

  it('calls actionFn for different requests', async () => {
    const req1 = { headers: {} };
    const req2 = { headers: {} };

    const wrappedFn = withGasketRequest(actionFn);
    const result1 = await wrappedFn(gasket, req1);
    const result2 = await wrappedFn(gasket, req2);

    expect(result1).toBe(valueA);
    expect(result2).toBe(valueB);
    expect(actionFn).toHaveBeenCalledTimes(2);
  });
});
