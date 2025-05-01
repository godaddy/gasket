import { makeGasketRequest, WeakPromiseKeeper } from '@gasket/request';
import { cookies, headers } from 'next/headers';

/** @typedef {import('@gasket/request').GasketRequest} GasketRequest */

/**
 * @type {import('@gasket/request').WeakPromiseKeeper<Headers, GasketRequest>}
 */
const keeper = new WeakPromiseKeeper();

/** @type {import('.').request} */
export async function request(params) {
  const headerStore = await headers();

  if (!keeper.has(headerStore)) {
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
    };

    keeper.set(headerStore, make());
  }

  return keeper.get(headerStore);
}
