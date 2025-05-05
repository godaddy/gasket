import { makeGasketRequest, WeakPromiseKeeper } from '@gasket/request';
import { cookies, headers } from 'next/headers';

/**
 * @type {import('@gasket/request').WeakPromiseKeeper<ReturnType<typeof headers>, import('@gasket/request').GasketRequest>}
 */
const keeper = new WeakPromiseKeeper();

/** @type {import('./index.d.ts').request} */
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

      // Convert headers to a simple object
      /** @type {Record<string, string>} */
      const headerEntries = {};
      if (headerStore instanceof Headers) {
        headerStore.forEach((value, key) => {
          headerEntries[key] = value;
        });
      } else {
        // Handle the mock case where headerStore is already an object
        for (const [key, value] of Object.entries(headerStore)) {
          if (typeof value === 'string') {
            headerEntries[key] = value;
          }
        }
      }

      return makeGasketRequest({
        headers: headerEntries,
        cookies: cookieEntries,
        query
      });
    };

    keeper.set(headerStore, make());
  }

  return keeper.get(headerStore);
}
