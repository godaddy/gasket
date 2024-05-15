import { cookies, headers } from 'next/headers';

const reqCache = new Map();

/**
 * Get a request-like object unique to the current request in server components.
 * @param {Object} [query] - Optional query parameters to include in the request
 * @returns {Request} - Request-like object
 */
export function request(query) {
  const headerStore = headers();

  if (!reqCache.has(headerStore)) {
    const cookieStore = cookies();

    const req = {
      cookies: cookieStore.getAll()
        .reduce((acc, { name, value }) => {
          acc[name] = value;
          return acc;
        }, {}),
      // @ts-ignore - TODO: entries is not available on Headers here for some reason..
      headers: Object.fromEntries(headerStore.entries())
    };

    if (query) {
      req.query = query;
    }

    reqCache.set(headerStore, req);
  }

  return reqCache.get(headerStore);
}
