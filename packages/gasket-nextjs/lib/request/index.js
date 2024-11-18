import { makeGasketRequest } from '@gasket/request';
import { cookies, headers } from 'next/headers';

const reqCache = new WeakMap();

/** @type {import('.').request} */
export async function request(params) {
  const headerStore = await headers();

  if (!reqCache.has(headerStore)) {
    const [
      cookieStore,
      query
    ] = await Promise.all([cookies(), params]);

    const req = await makeGasketRequest({
      headers: headerStore,
      cookies: cookieStore,
      query
    });

    reqCache.set(headerStore, req);
  }

  return reqCache.get(headerStore);
}
