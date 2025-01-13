import { expect } from '@jest/globals';
import { makeGasketRequest, GasketRequest } from '../lib/request.js';

const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class MockCookieStore {
  constructor(cookies) {
    this.cookies = cookies;
  }

  async getAll() {
    await pause(100);
    return this.cookies;
  }
}

describe('makeGasketRequest', () => {
  it('returns a GasketRequest instance with correct properties', async () => {
    const requestLike = {
      headers: new Map([['header1', 'value1'], ['header2', 'value2']]),
      cookies: {
        cookie1: 'value1',
        cookie2: 'value2'
      },
      query: { query1: 'value1', query2: 'value2' },
      path: '/path/to/page'
    };

    const result = await makeGasketRequest(requestLike);

    expect(result).toBeInstanceOf(GasketRequest);
    expect(result.headers).toEqual({ header1: 'value1', header2: 'value2' });
    expect(result.cookies).toEqual({ cookie1: 'value1', cookie2: 'value2' });
    expect(result.query).toEqual({ query1: 'value1', query2: 'value2' });
    expect(result.path).toEqual('/path/to/page');
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

  it('handles URLSearchParams array values', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const query = new URLSearchParams({ query1: 'value1', query2: 'value2' });
    query.append('query3', 'value3');
    query.append('query3', 'value4');
    const requestLike = { headers, cookies: {}, query };

    const result = await makeGasketRequest(requestLike);

    expect(result.query).toEqual({
      query1: 'value1',
      query2: 'value2',
      query3: ['value3', 'value4']
    });
  });

  it('handles no query', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const requestLike = { headers, cookies: {} };

    const result = await makeGasketRequest(requestLike);

    expect(result.query).toEqual({});
  });

  it('handles Next15 style CookieStore for cookies', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const cookieStore = new MockCookieStore([
      { name: 'cookie1', value: 'value1' },
      { name: 'cookie2', value: 'value2' }
    ]);
    const requestLike = { headers, cookies: cookieStore };

    const result = await makeGasketRequest(requestLike);

    expect(result.cookies).toEqual({ cookie1: 'value1', cookie2: 'value2' });
  });

  it('handles Next14 style CookieStore for cookies', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const cookieStore = {
      getAll() {
        return [
          { name: 'cookie1', value: 'value1' },
          { name: 'cookie2', value: 'value2' }
        ];
      }
    };
    const requestLike = { headers, cookies: cookieStore };

    const result = await makeGasketRequest(requestLike);

    expect(result.cookies).toEqual({ cookie1: 'value1', cookie2: 'value2' });
  });

  it('handles no cookies', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const requestLike = { headers };

    const result = await makeGasketRequest(requestLike);

    expect(result.cookies).toEqual({});
  });

  it('handles path for path', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const path = '/path/to/page';
    const requestLike = { headers, path };

    const result = await makeGasketRequest(requestLike);

    expect(result.path).toEqual('/path/to/page');
  });

  it('handles no path', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const requestLike = { headers };

    const result = await makeGasketRequest(requestLike);

    expect(result.path).toEqual('');
  });

  it('handles NextRequest objects', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const cookies = new MockCookieStore([
      { name: 'cookie1', value: 'value1' },
      { name: 'cookie2', value: 'value2' }
    ]);
    const nextUrl = new URL('https://example.com/path/to/page?query1=value1&query2=value2');
    const requestLike = { headers, cookies, nextUrl };

    const result = await makeGasketRequest(requestLike);

    expect(result.headers).toEqual({ header1: 'value1', header2: 'value2' });
    expect(result.cookies).toEqual({ cookie1: 'value1', cookie2: 'value2' });
    expect(result.query).toEqual({ query1: 'value1', query2: 'value2' });
    expect(result.path).toEqual('/path/to/page');
  });

  it('handles IncomingMessage object urls', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const url = '/path/to/page';
    const requestLike = { headers, url };

    const result = await makeGasketRequest(requestLike);

    expect(result.headers).toEqual({ header1: 'value1', header2: 'value2' });
    expect(result.query).toEqual({});
    expect(result.path).toEqual('/path/to/page');
  });

  it('handles IncomingMessage object empty urls', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const url = '';
    const requestLike = { headers, url };

    const result = await makeGasketRequest(requestLike);

    expect(result.headers).toEqual({ header1: 'value1', header2: 'value2' });
    expect(result.query).toEqual({});
    expect(result.path).toEqual('/');
  });

  it('handles IncomingMessage object urls with query', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const url = '/path/to/page?query1=value1&query2=value2';
    const requestLike = { headers, url };

    const result = await makeGasketRequest(requestLike);

    expect(result.headers).toEqual({ header1: 'value1', header2: 'value2' });
    expect(result.query).toEqual({ query1: 'value1', query2: 'value2' });
    expect(result.path).toEqual('/path/to/page');
  });

  it('handles IncomingMessage object url with query and hash', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const url = '/path/to/page?query1=value1&query2=value2#hash';
    const requestLike = { headers, url };

    const result = await makeGasketRequest(requestLike);

    expect(result.headers).toEqual({ header1: 'value1', header2: 'value2' });
    expect(result.query).toEqual({ query1: 'value1', query2: 'value2' });
    expect(result.path).toEqual('/path/to/page');
  });

  it('handles IncomingMessage with headersDistinct shape (IncomingHttpHeaders)', async () => {
    /** @type {IncomingHttpHeaders} */
    const headers = { header1: 'value1', header2: ['value2'], header3: ['value3-1', 'value3-2'] };
    const requestLike = { headers };

    const result = await makeGasketRequest(requestLike);

    expect(result.headers).toEqual({ header1: 'value1', header2: 'value2', header3: 'value3-1, value3-2' });
  });

  it('only processes url if query or path not set', async () => {
    const query = {
      query1: 'value1',
      query2: 'value2'
    };
    const path = '/path/to/page';
    const url = '/another/page?queryA=valueA&queryB=valueB';

    // use url
    const result = await makeGasketRequest({ headers: {}, url });
    expect(result.path).toEqual('/another/page');
    expect(result.query).toEqual({ queryA: 'valueA', queryB: 'valueB' });

    // stick to path
    const result2 = await makeGasketRequest({ headers: {}, path, url });
    expect(result2.path).toEqual(path);
    expect(result2.query).toEqual({ queryA: 'valueA', queryB: 'valueB' });

    // stick to query
    const result3 = await makeGasketRequest({ headers: {}, query, url });
    expect(result.path).toEqual('/another/page');
    expect(result3.query).toEqual(query);
  });

  it('handles Express request objects', async () => {
    const headers = {
      header1: 'value1',
      header2: 'value2'
    };
    const cookies = {
      cookie1: 'value1',
      cookie2: 'value2'
    };
    const query = {
      query1: 'value1',
      query2: 'value2'
    };
    const path = '/path/to/page';
    const requestLike = { headers, cookies, query, path };

    const result = await makeGasketRequest(requestLike);

    expect(result.headers).toEqual({ header1: 'value1', header2: 'value2' });
    expect(result.cookies).toEqual({ cookie1: 'value1', cookie2: 'value2' });
    expect(result.query).toEqual({ query1: 'value1', query2: 'value2' });
    expect(result.path).toEqual('/path/to/page');
  });

  it('handles parallel executions', async () => {
    const headers = new Map([['header1', 'value1'], ['header2', 'value2']]);
    const cookies = new MockCookieStore([
      { name: 'cookie1', value: 'value1' },
      { name: 'cookie2', value: 'value2' }
    ]);
    const nextUrl = new URL('https://example.com/path/to/page?query1=value1&query2=value2');
    const requestLike = { headers, cookies, nextUrl };

    const promise1 = makeGasketRequest(requestLike);
    const promise2 = makeGasketRequest(requestLike);

    expect(promise1).toBeInstanceOf(Promise);
    expect(promise2).toBeInstanceOf(Promise);

    const results1 = await promise1;
    const results2 = await promise2;

    expect(results1).toBe(results2);
  });
});
