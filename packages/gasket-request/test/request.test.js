
import { makeGasketRequest, GasketRequest, getOriginalRequest } from '../lib/request.js';

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
    /** @type {import('http').IncomingHttpHeaders} */
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

  it('captures the method from the request', async () => {
    const result = await makeGasketRequest({ headers: { header1: 'value1' }, method: 'POST' });

    expect(result.method).toEqual('POST');
  });

  it('uppercases the method', async () => {
    const result = await makeGasketRequest({ headers: { header2: 'value2' }, method: 'get' });

    expect(result.method).toEqual('GET');
  });

  it('has no method when the source provides none', async () => {
    const result = await makeGasketRequest({ headers: { header3: 'value3' } });

    expect(result.method).toBeUndefined();
  });

  it('has no method when the source method is not a string', async () => {
    const result = await makeGasketRequest({ headers: { header4: 'value4' }, method: 123 });

    expect(result.method).toBeUndefined();
  });

  it('captures the method from a NextRequest style object', async () => {
    const headers = new Map([['header10', 'value10']]);
    const nextUrl = new URL('https://example.com/path/to/page?query1=value1');

    const result = await makeGasketRequest({ headers, nextUrl, method: 'DELETE' });

    expect(result.method).toEqual('DELETE');
    expect(result.path).toEqual('/path/to/page');
  });

  it('reads method from the prototype, as fetch Request exposes it', async () => {
    // method and url are prototype getters on Request, not own properties
    const request = new Request('https://example.com/path/to/page', { method: 'post' });

    const result = await makeGasketRequest(request);

    expect(result.method).toEqual('POST');
    expect(result.path).toEqual('/path/to/page');
  });

  it('has no method for an App Router style request-like, and does not assume GET', async () => {
    // next/headers exposes no method; a GET default would be wrong during a
    // Server Action, which runs as POST and re-renders RSC in the same request
    const result = await makeGasketRequest({
      headers: { header5: 'value5' },
      cookies: { cookie1: 'value1' },
      query: { query1: 'value1' }
    });

    expect(result.method).toBeUndefined();
    expect(result.method).not.toEqual('GET');
  });

  it('parses cookie header if cookies property is missing', async () => {
    const headers = {
      cookie: 'cookie1=value1; cookie2=value2'
    };
    const requestLike = { headers };

    const result = await makeGasketRequest(requestLike);

    expect(result.cookies).toEqual({ cookie1: 'value1', cookie2: 'value2' });
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

describe('getOriginalRequest', () => {
  it('returns the request the GasketRequest was made from', async () => {
    const requestLike = { headers: { header1: 'value1' }, ip: '203.0.113.42' };

    const result = await makeGasketRequest(requestLike);

    expect(getOriginalRequest(result)).toBe(requestLike);
  });

  it('returns the same original across repeated calls', async () => {
    const requestLike = { headers: { header2: 'value2' } };

    const first = await makeGasketRequest(requestLike);
    const second = await makeGasketRequest(requestLike);

    expect(first).toBe(second);
    expect(getOriginalRequest(second)).toBe(requestLike);
  });

  it('keeps the first original when two request-likes share headers', async () => {
    const headers = { header3: 'value3' };
    const first = { headers, ip: '203.0.113.1' };
    const second = { headers, ip: '203.0.113.2' };

    await makeGasketRequest(first);
    const result = await makeGasketRequest(second);

    expect(getOriginalRequest(result)).toBe(first);
  });

  it('returns one original for parallel calls', async () => {
    const requestLike = { headers: { header4: 'value4' } };

    const [one, two] = await Promise.all([
      makeGasketRequest(requestLike),
      makeGasketRequest(requestLike)
    ]);

    expect(one).toBe(two);
    expect(getOriginalRequest(one)).toBe(requestLike);
  });

  it('preserves the original through the passthrough path', async () => {
    const requestLike = { headers: { header5: 'value5' } };

    const made = await makeGasketRequest(requestLike);
    const again = await makeGasketRequest(made);

    expect(again).toBe(made);
    expect(getOriginalRequest(again)).toBe(requestLike);
  });

  it('returns the assembled request-like for an App Router style request', async () => {
    // Truthy, but with no ip on it — callers must guard the field, not the object
    const requestLike = {
      headers: { header11: 'value11' },
      cookies: { cookie1: 'value1' },
      query: { query1: 'value1' }
    };

    const result = await makeGasketRequest(requestLike);
    const original = getOriginalRequest(result);

    expect(original).toBe(requestLike);
    expect(Boolean(original)).toBe(true);
    expect(original.ip).toBeUndefined();
  });

  it('has no original for a directly constructed GasketRequest', () => {
    const request = new GasketRequest({ headers: {}, cookies: {}, query: {}, path: '/' });

    expect(getOriginalRequest(request)).toBeUndefined();
  });

  it('returns undefined rather than throwing for values that are not requests', () => {
    expect(getOriginalRequest(null)).toBeUndefined();
    expect(getOriginalRequest(undefined)).toBeUndefined();
    expect(getOriginalRequest({})).toBeUndefined();
    expect(getOriginalRequest('nope')).toBeUndefined();
  });

  it('hides the original from enumeration, spread, and serialization', async () => {
    const requestLike = { headers: { header6: 'value6' }, ip: '203.0.113.42' };

    const result = await makeGasketRequest(requestLike);

    expect(Object.keys(result)).toEqual(['headers', 'cookies', 'query', 'path', 'method']);
    expect(JSON.stringify(result)).not.toContain('203.0.113.42');
    expect(getOriginalRequest({ ...result })).toBeUndefined();
  });

  it('stores the original as a locked-down property', async () => {
    const requestLike = { headers: { header7: 'value7' } };

    const result = await makeGasketRequest(requestLike);
    const descriptor = Object.getOwnPropertyDescriptor(
      result,
      Symbol.for('gasket.originalRequest')
    );

    expect(descriptor.enumerable).toBe(false);
    expect(descriptor.writable).toBe(false);
    expect(descriptor.configurable).toBe(false);
  });

  it('reads through the global symbol registry', async () => {
    // Stands in for a second installed copy of this package resolving its own
    // Symbol.for reference to the same slot
    const requestLike = { headers: { header8: 'value8' }, ip: '203.0.113.42' };
    const standIn = {};
    Object.defineProperty(standIn, Symbol.for('gasket.originalRequest'), {
      value: requestLike,
      enumerable: false
    });

    expect(getOriginalRequest(standIn)).toBe(requestLike);
  });

  it('has no original after a serialize and revive round trip', async () => {
    const requestLike = { headers: { header9: 'value9' } };

    const result = await makeGasketRequest(requestLike);
    const revived = JSON.parse(JSON.stringify(result));

    expect(revived.headers).toEqual({ header9: 'value9' });
    expect(getOriginalRequest(revived)).toBeUndefined();
  });
});
