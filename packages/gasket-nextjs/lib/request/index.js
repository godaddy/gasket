import { makeGasketRequest, WeakPromiseKeeper } from '@gasket/request';
import { cookies, headers } from 'next/headers';

/**
 * @type {import('@gasket/request').WeakPromiseKeeper<Headers, import('@gasket/request').GasketRequest>}
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

      /** @type {Record<string, string>} */
      const cookieEntries = {};

      for (const { name, value } of cookieStore.getAll()) {
        cookieEntries[name] = value;
      }

      return makeGasketRequest({
        headers: headerStore,
        cookies: cookieEntries,
        query
      });
    };

    keeper.set(headerStore, make());
  }

  return keeper.get(headerStore);
}
