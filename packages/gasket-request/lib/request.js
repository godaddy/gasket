const normalizedReqMap = new WeakMap();

/**
 * @type {import('./index.js').objectFromCookieStore}
 */
async function objectFromCookieStore(cookieStore) {
  return await cookieStore.getAll()
    .reduce((acc, { name, value }) => {
      acc[name] = value;
      return acc;
    }, {});
}

/**
 * @type {import('./index.js').GasketRequest}
 */
export class GasketRequest {
  static async make(requestLike) {
    return await makeGasketRequest(requestLike);
  }

  constructor(normalizedRequest) {
    this.headers = normalizedRequest.headers;
    this.cookies = normalizedRequest.cookies;
    this.query = normalizedRequest.query;
    this.url = normalizedRequest.url;
  }
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

  let query = requestLike.query;

  //
  if (!query && 'nextUrl' in requestLike) {
    query = requestLike.nextUrl.searchParams;
  }

  query ??= {};

  if (!normalizedReqMap.has(headers)) {
    const normalized = new GasketRequest(Object.seal({
      // @ts-ignore - entries not available on Headers here..
      headers: headers.constructor.prototype.entries ? Object.fromEntries(headers.entries()) : headers,
      cookies: cookies.constructor.prototype.getAll ? await objectFromCookieStore(cookies) : cookies,
      query: query instanceof URLSearchParams ? Object.fromEntries(query) : query
    }));

    normalizedReqMap.set(headers, normalized);
    return normalized;
  }

  return normalizedReqMap.get(headers);
}
