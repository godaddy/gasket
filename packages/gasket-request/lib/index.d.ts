import type { RequestLike } from '../internal.d.ts';
import type { ActionHandler } from '@gasket/core';

export type RequestLike = {
  headers: Headers | Record<string, string>
  cookies?: CookieStore | Record<string, string>
  query?: URLSearchParams | Record<string, string>
  url?: string
  [key: string]: any
}

/**
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CookieStore/getAll
 * @param cookieStore
 */
async function objectFromCookieStore(cookieStore: CookieStore): Promise<Record<string, string>>;

/**
 * Expected request shape for GasketActions
 */
export class GasketRequest {
  constructor(normalized: {
    headers: Record<string, string>,
    cookies: Record<string, string>,
    query: Record<string, string>
  });
  headers: Record<string, string>
  cookies: Record<string, string>
  query: Record<string, string>
}

/**
 * Get a normalized request object for GasketActions
 */
export async function makeGasketRequest(req: RequestLike): Promise<GasketRequest>;

export async function withGasketRequest<T>(actionFn: ActionHandler<T>): ActionHandler<T>;

export async function withGasketRequestCache<T>(actionFn: ActionHandler<T>): ActionHandler<T>;
