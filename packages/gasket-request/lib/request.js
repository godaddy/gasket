import { WeakPromiseKeeper } from './keeper.js';

/**
 * @type {import('./index.js').GasketRequest}
 */
export class GasketRequest {
  constructor(normalizedRequest) {
    this.headers = normalizedRequest.headers;
    this.cookies = normalizedRequest.cookies;
    this.query = normalizedRequest.query;
    this.path = normalizedRequest.path;
  }
}

/**
 * @type {import('./index.js').WeakPromiseKeeper<Headers|Record<string,string>, GasketRequest>}
 */
const keeper = new WeakPromiseKeeper();

/**
 * @type {import('./index.js').objectFromCookieStore}
 */
async function objectFromCookieStore(cookieStore) {
  return (await cookieStore.getAll())
    .reduce((acc, { name, value }) => {
      acc[name] = value;
      return acc;
    }, {});
}

/**
 * @type {import('./index.js').objectFromSearchParams}
 */
function objectFromSearchParams(searchParams) {
  const entries = Object.fromEntries(searchParams);
  const keys = Object.keys(entries);
  return keys.reduce((acc, key) => {
    const value = searchParams.getAll(key);
    acc[key] = value.length === 1 ? value[0] : value;
    return acc;
  }, {});
}

/**
 * @type {import('./index.js').makeGasketRequest}
 */
export async function makeGasketRequest(requestLike) {
  if (requestLike instanceof GasketRequest) {
    return requestLike;
  }

  const { headers, cookies = {} } = requestLike;

  if (!headers) {
    throw new Error('request argument must have headers');
  }

  if (!keeper.has(headers)) {
    const normalize = async () => {

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

      return new GasketRequest(Object.seal({
        headers: 'entries' in headers ? Object.fromEntries(headers.entries()) : headers,
        cookies: 'getAll' in cookies ? await objectFromCookieStore(cookies) : cookies,
        query: query instanceof URLSearchParams ? objectFromSearchParams(query) : query,
        path
      }));
    };

    keeper.set(headers, normalize());
  }
  return keeper.get(headers);
}
