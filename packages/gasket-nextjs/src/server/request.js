import { cookies, headers } from 'next/headers';

const reqCache = new Map();

// TODO: move this to `@gasket/nextjs` package
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
      headers: Object.fromEntries(headerStore.entries())
    };

    if (query) {
      req.query = query;
    }

    reqCache.set(headerStore, req);
  }

  return reqCache.get(headerStore);
}
