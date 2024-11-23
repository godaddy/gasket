import type { RequestLike } from '../internal.d.ts';
import type { Gasket } from '@gasket/core';

export type RequestLike = {
  headers: Headers | Record<string, string>
  cookies?: CookieStore | Record<string, string>
  query?: URLSearchParams | Record<string, string>
  url?: string
  [key: string]: any
}

/**
 * Capture the cookies as a key/value object
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CookieStore/getAll
 */
async function objectFromCookieStore(cookieStore: CookieStore): Promise<Record<string, string>>;

/**
 * Expected request shape for GasketActions
 */
export class GasketRequest {
  constructor(normalized: {
    headers: Record<string, string>,
    cookies: Record<string, string>,
    query: Record<string, string>,
    path: string
  });

  headers: Record<string, string>
  cookies: Record<string, string>
  query: Record<string, string>
  path: string
}

export class WeakPromiseKeeper<Key extends WeakKey = WeakKey, Value = any> {
  set(key: Key, value: Promise<Value>): this
  get(key: Key): Promise<Value> | Value
  has(key: Key): boolean
  delete(key: Key): boolean
}

/**
 * Get a normalized request object for GasketActions
 */
export async function makeGasketRequest(req: RequestLike): Promise<GasketRequest>;

type RequestActionFn<Result, Args extends Array<unknown>> = (gasket: Gasket, req: RequestLike, ...args: Args) => Promise<Result>;
type RequestActionWrapperFn<Result, Args extends Array<unknown>> = (gasket: Gasket, req: GasketRequest, ...args: Args) => Promise<Result>;

export function withGasketRequest<Result, Args extends Array<unknown>>(actionFn: RequestActionFn<Result, Args>): RequestActionWrapperFn<Result, Args>;
export function withGasketRequestCache<Result, Args extends Array<unknown>>(actionFn: RequestActionFn<Result, Args>): RequestActionWrapperFn<Result, Args>;
