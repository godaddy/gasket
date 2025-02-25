import type { Gasket } from '@gasket/core';

/**
 * Represents a request-like object for Gasket.
 */
export type RequestLike = {
  headers: Headers | Record<string, string> & {
    entries?: Function;
  };
  // eslint-disable-next-line no-undef
  cookies?: CookieStore | Record<string, string>;
  query?: URLSearchParams | Record<string, string | string[]>;
  url?: string;
  [key: string]: any;
};

/**
 * Captures cookies from the CookieStore as a key-value object.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CookieStore/getAll
 */
export async function objectFromCookieStore(
  // eslint-disable-next-line no-undef
  cookieStore: CookieStore
): Promise<Record<string, string>>;

/**
 * Captures search parameters from URLSearchParams as a key-value object.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
 */
export async function objectFromSearchParams(searchParams: URLSearchParams): Record<string, string>;

/**
 * Represents a normalized request object for GasketActions.
 */
export class GasketRequest {
  constructor(normalized: {
    headers: Record<string, string>;
    cookies: Record<string, string>;
    query: Record<string, string>;
    path: string;
  });

  headers: Record<string, string>;
  cookies: Record<string, string>;
  query: Record<string, string>;
  path: string;
}

/**
 * A cache that holds promises for weakly referenced objects.
 */
// eslint-disable-next-line no-undef
export class WeakPromiseKeeper<Key extends WeakKey = WeakKey, Value = any> {
  set(key: Key, value: Promise<Value>): this;
  get(key: Key): Promise<Value> | Value;
  has(key: Key): boolean;
  delete(key: Key): boolean;
}

/**
 * Normalizes a request into a GasketRequest object.
 */
export async function makeGasketRequest(req: RequestLike): Promise<GasketRequest>;

/**
 * Wraps a request action function with a GasketRequest transformation.
 */
type RequestActionFn<Result, Args extends Array<unknown>> = (
  gasket: Gasket,
  req: GasketRequest,
  ...args: Args
) => Promise<Result>;

/**
 * Wraps an action function to accept a generic request-like object.
 */
type RequestActionWrapperFn<Result, Args extends Array<unknown>> = (
  gasket: Gasket,
  req: RequestLike,
  ...args: Args
) => Promise<Result>;

/**
 * Wraps a request action function, ensuring it receives a GasketRequest.
 */
export function withGasketRequest<Result, Args extends Array<unknown>>(
  actionFn: RequestActionFn<Result, Args>
): RequestActionWrapperFn<Result, Args>;

/**
 * Wraps a request action function with caching enabled.
 */
export function withGasketRequestCache<Result, Args extends Array<unknown>>(
  actionFn: RequestActionFn<Result, Args>
): RequestActionWrapperFn<Result, Args>;

