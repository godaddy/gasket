import { expect } from '@jest/globals';
import { makeGasketRequest, GasketRequest } from '../lib/request.js';

describe('makeGasketRequest', () => {
  it('returns a GasketRequest instance with correct properties', async () => {
    const requestLike = {
      headers: new Map([['header1', 'value1'], ['header2', 'value2']]),
      cookies: {
        cookie1: 'value1',
        cookie2: 'value2'
      },
      query: { query1: 'value1', query2: 'value2' }
    };

    const result = await makeGasketRequest(requestLike);

    expect(result).toBeInstanceOf(GasketRequest);
    expect(result.headers).toEqual({ header1: 'value1', header2: 'value2' });
    expect(result.cookies).toEqual({ cookie1: 'value1', cookie2: 'value2' });
    expect(result.query).toEqual({ query1: 'value1', query2: 'value2' });
  });

  it('throws an error if headers are missing', async () => {
    const requestLike = {
      cookies: {
        cookie1: 'value1',
        cookie2: 'value2'
      },
      query: { query1: 'value1', query2: 'value2' }
    };

    await expect(makeGasketRequest(requestLike)).rejects.toThrow('request argument must have headers');
  });

  it('returns the same instance for the same headers', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const requestLike1 = { headers };
    const requestLike2 = { headers };

    const result1 = await makeGasketRequest(requestLike1);
    const result2 = await makeGasketRequest(requestLike2);

    expect(result1).toBe(result2);
  });

  it('returns a new instance for different headers', async () => {
    const headers1 = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const headers2 = new Map([['header3', 'value3'], ['header4', 'value4']]);
    const requestLike1 = { headers: headers1, cookies: {}, query: {} };
    const requestLike2 = { headers: headers2, cookies: {}, query: {} };

    const result1 = await makeGasketRequest(requestLike1);
    const result2 = await makeGasketRequest(requestLike2);

    expect(result1).not.toBe(result2);
  });

  it('handles URLSearchParams for query', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const query = new URLSearchParams({ query1: 'value1', query2: 'value2' });
    const requestLike = { headers, cookies: {}, query };

    const result = await makeGasketRequest(requestLike);

    expect(result.query).toEqual({ query1: 'value1', query2: 'value2' });
  });

  it('handles empty query', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const requestLike = { headers, cookies: {} };

    const result = await makeGasketRequest(requestLike);

    expect(result.query).toEqual({});
  });
});
