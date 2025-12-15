/** @jest-environment node */

import { GasketRequest } from '@gasket/request';


class MockCookieStore {
  constructor(cookies) {
    this.cookies = cookies;
  }

  getAll() {
    return this.cookies;
  }
}

const mockCookies = vi.fn().mockReturnValue(
  new MockCookieStore([
    { name: 'cookie1', value: 'value1' },
    { name: 'cookie2', value: 'value2' }
  ])
);

const mockHeaders = vi.fn();

vi.mock('next/headers', () => {
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
    mockHeaders.mockResolvedValue(new Headers([
      ['header1', 'value1'],
      ['header2', 'value2']
    ]));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns GasketRequest instance', async () => {
    const results1 = await request();
    expect(results1).toBeInstanceOf(GasketRequest);
  });

  it('returns same instance for repeat request', async () => {
    const results1 = await request();
    const results2 = await request();
    expect(results1).toBe(results2);
  });

  it('handles parallel execution', async () => {
    const promise1 = request();
    const promise2 = request();

    expect(promise1).toBeInstanceOf(Promise);
    expect(promise2).toBeInstanceOf(Promise);

    const results1 = await promise1;
    const results2 = await promise2;
    expect(results1).toBe(results2);
  });

  it('returns unique instance when headers differ', () => {
    mockHeaders.mockReturnValueOnce({ entries: vi.fn().mockReturnValueOnce([]) });

    const results1 = request();
    const results2 = request();
    expect(results1).not.toBe(results2);
  });

  it('cookies is an object', async () => {
    const results = await request();
    expect(results.cookies).toEqual(expect.objectContaining({
      cookie1: 'value1',
      cookie2: 'value2'
    }));
  });

  it('headers is an object', async () => {
    const results = await request();
    expect(results.headers).toEqual(expect.objectContaining({
      header1: 'value1',
      header2: 'value2'
    }));
  });

  it('has query if passed', async () => {
    const params = { query1: 'value1', query2: 'value2' };
    const results = await request(params);
    expect(results.query).toEqual(params);
  });

  it('default query if not passed', async () => {
    const results = await request();
    expect(results.query).toEqual({});
  });

  it('allows query to be URLSearchParams', async () => {
    const params = new URLSearchParams({ query1: 'value1', query2: 'value2' });
    const results = await request(params);
    expect(results.query).toEqual(expect.objectContaining({ query1: 'value1', query2: 'value2' }));
  });
});
