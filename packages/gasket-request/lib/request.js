import { WeakPromiseKeeper } from './keeper.js';
import { parse } from 'cookie';

/**
 * Represents a normalized Gasket request.
 * @type {import('@gasket/request').GasketRequest}
 */
export class GasketRequest {
  constructor({ headers, cookies, query, path }) {
    this.headers = headers;
    this.cookies = cookies;
    this.query = query;
    this.path = path;
  }
}

/**
 * Weak reference cache for request headers
 * @type {import('@gasket/request').WeakPromiseKeeper<import('@gasket/request').HeadersLike, GasketRequest>}
 */
const keeper = new WeakPromiseKeeper();

/**
 * Converts a cookie store into an object.
 * @type {import('@gasket/request').objectFromCookieStore}
 */
async function objectFromCookieStore(cookieStore) {
  const cookies = await cookieStore.getAll();
  return cookies.reduce((cookieMap, { name, value }) => {
    cookieMap[name] = value;
    return cookieMap;
  }, {});
}

/**
 * Converts search parameters to an object, preserving multiple values as arrays.
 * @type {import('@gasket/request').objectFromSearchParams}
 */
function objectFromSearchParams(searchParams) {
  return Array.from(searchParams.keys()).reduce((params, key) => {
    const values = searchParams.getAll(key);
    params[key] = values.length === 1 ? values[0] : values;
    return params;
  }, {});
}

/**
 * @type {import('@gasket/request').makeGasketRequest}
 */
export async function makeGasketRequest(requestLike) {
  if (requestLike instanceof GasketRequest) {
    return requestLike;
  }

  const { headers: rawHeaders } = requestLike;

  if (!rawHeaders) {
    throw new Error('request argument must have headers');
  }

  if (!keeper.has(rawHeaders)) {
    const normalize = async () => {

      // handle Headers objects
      const headers = 'entries' in rawHeaders && typeof rawHeaders.entries === 'function' ?
        Object.fromEntries(rawHeaders.entries()) :
        rawHeaders;

      // handle when header values are arrays
      // https://nodejs.org/api/http.html#messageheadersdistinct
      Object.entries(headers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          headers[key] = value.join(', ');
        }
      });

      // handle Express Request objects
      let query = requestLike.query;
      let path = requestLike.path;

      // handle NextRequest objects
      if ('nextUrl' in requestLike) {
        query ??= requestLike.nextUrl.searchParams;
        path ??= requestLike.nextUrl.pathname;
      }

      // handle IncomingMessage objects
      if ((!path || !query) && 'url' in requestLike) {
        const url = new URL(requestLike.url, 'http://localhost');
        path ??= url.pathname;
        query ??= url.searchParams;
      }

      query ??= {};
      path ??= '';

      // handle cookies if not already parsed
      let cookies = requestLike.cookies;
      if (!cookies) {
        cookies = 'cookie' in headers ? parse(headers.cookie) : {};
      }

      return new GasketRequest(Object.seal({
        headers,
        cookies: 'getAll' in cookies ? await objectFromCookieStore(cookies) : cookies,
        query: query instanceof URLSearchParams ? objectFromSearchParams(query) : query,
        path
      }));
    };

    keeper.set(rawHeaders, normalize());
  }
  return keeper.get(rawHeaders);
}
