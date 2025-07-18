import type { Gasket, MaybeAsync } from '@gasket/core';
import { IncomingHttpHeaders } from 'http';
import type { Request as ExpressRequest } from 'express';
import type { FastifyRequest } from 'fastify';

interface Cookie {
  domain: string;
  expires: number;
  name: string;
  partitioned: boolean;
  path: string;
  sameSite: 'Strict' | 'Lax' | 'None';
  secure: boolean;
  value: string;
}

interface CookieChangedEvent extends Event {
  changed: Readonly<Array<Cookie>>;
  deleted: Readonly<Array<Cookie>>;
}

interface CookieStore {
  get(name: string): Promise<Cookie | null>;
  get(options: { name: string; url?: string }): Promise<Cookie | null>;
  getAll(): Promise<Cookie[]>;
  getAll(name: string): Promise<Cookie[]>;
  getAll(options: { name?: string; url?: string }): Promise<Cookie[]>;
  set(name: string, value: string): Promise<void>;
  set(
    options: Partial<Cookie> & { name: string; value: string },
  ): Promise<void>;
  delete(name: string): Promise<void>;
  delete(options: { name: string; url?: string }): Promise<void>;
  addEventListener(
    eventName: 'change',
    handler: (event: CookieChangedEvent) => void,
  ): void;
  removeEventListener(
    eventName: 'change',
    handler: (event: CookieChangedEvent) => void,
  ): void;
  onchange: null | ((event: CookieChangedEvent) => void);
}

/**
 * Represents potential headers shapes in a request-like objects.
 */
export type HeadersLike = Headers | IncomingHttpHeaders | Record<string, string> & {
    entries?: Function;
}

/**
 * Represents a request-like object for Gasket.
 */
export type RequestLike = {
  headers: HeadersLike;
  cookies?: CookieStore | Record<string, string>;
  query?: URLSearchParams | Record<string, string | string[]> | ExpressRequest['query'] | FastifyRequest['query'];
  url?: string;
  [key: string]: any;
};

/**
 * Captures cookies from the CookieStore as a key-value object.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CookieStore/getAll
 */
export function objectFromCookieStore(
  cookieStore: Partial<CookieStore> | CookieStore
): Promise<Record<string, string>>;

/**
 * Captures search parameters from URLSearchParams as a key-value object.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
 */
export function objectFromSearchParams(searchParams: URLSearchParams): Record<string, string>;

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
export function makeGasketRequest(req: RequestLike): MaybeAsync<GasketRequest>;

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

