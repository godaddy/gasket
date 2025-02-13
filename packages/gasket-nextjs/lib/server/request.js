import { cookies, headers } from 'next/headers';

const reqCache = new WeakMap();

/** @type {import('.').request} */
export function request(query) {
  console.warn('DEPRECATED: use async `request` from @gasket/nextjs/request');

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
      req.query = query instanceof URLSearchParams
        ? Object.fromEntries(query)
        : query;
    }

    reqCache.set(headerStore, req);
  }

  return reqCache.get(headerStore);
}
