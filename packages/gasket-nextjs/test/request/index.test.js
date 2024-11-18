// eslint-disable-next-line jsdoc/check-tag-names
/** @jest-environment node */

import { jest } from '@jest/globals';

const mockCookieStore = {
  getAll: jest.fn().mockResolvedValue([
    { name: 'cookie1', value: 'value1' },
    { name: 'cookie2', value: 'value2' }
  ])
};

const mockCookies = jest.fn()
  .mockResolvedValue(mockCookieStore);

const mockHeaderEntires = [
  ['header1', 'value1'],
  ['header2', 'value2']
];

const mockHeaderStore = {
  entries: jest.fn().mockReturnValue(mockHeaderEntires)
};


const mockHeaders = jest.fn()
  .mockResolvedValue(mockHeaderStore);

jest.mock('next/headers', () => {
  return {
    cookies: mockCookies,
    headers: mockHeaders
  };
});

describe('request', () => {
  let request;

  beforeAll(async () => {
    // must be dynamic to avoid hoisting static import to the top
    request = await import('../../lib/request').then((module) => module.request);
  });

  beforeEach(() => {
    mockHeaders.mockReturnValue({ entries: jest.fn().mockReturnValue(mockHeaderEntires) });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns same instance for repeat request', () => {
    const results1 = request();
    const results2 = request();
    expect(results1).toBe(results2);
  });

  it('returns unique instance when headers differ', () => {
    mockHeaders.mockReturnValueOnce({ entries: jest.fn().mockReturnValueOnce([]) });

    const results1 = request();
    const results2 = request();
    expect(results1).not.toBe(results2);
  });

  it('cookies is an object', () => {
    const results = request();
    expect(results).toEqual(expect.objectContaining({
      cookies: {
        cookie1: 'value1',
        cookie2: 'value2'
      }
    }));
  });

  it('headers is an object', () => {
    const results = request();
    expect(results).toEqual(expect.objectContaining({
      headers: {
        header1: 'value1',
        header2: 'value2'
      }
    }));
  });

  it('has query if passed', () => {
    const query = { query1: 'value1', query2: 'value2' };
    const results = request(query);
    expect(results).toEqual(expect.objectContaining({ query }));
  });

  it('no query if not passed', () => {
    const results = request();
    expect(results).not.toHaveProperty('query');
  });

  it('allows query to be URLSearchParams', () => {
    const query = new URLSearchParams({ query1: 'value1', query2: 'value2' });
    const results = request(query);
    expect(results).toEqual(expect.objectContaining({ query: { query1: 'value1', query2: 'value2' } }));
  });
});
