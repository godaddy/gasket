import { makeGasketRequest } from '@gasket/request';
import { cookies, headers } from 'next/headers';

const reqCache = new WeakMap();

/** @type {import('.').request} */
export async function request(params) {
  const headerStore = await headers();

  if (reqCache.has(headerStore)) {
    return reqCache.get(headerStore);
  }

  const make = async () => {
    const [
      cookieStore,
      query
    ] = await Promise.all([cookies(), params]);

    return makeGasketRequest({
      headers: headerStore,
      cookies: cookieStore,
      query
    });
  }

  const promise = make();
  reqCache.set(headerStore, promise);
  return await promise;
}
