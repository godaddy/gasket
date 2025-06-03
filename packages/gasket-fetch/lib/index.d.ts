/* global RequestInit, RequestInfo */
import type * as NodeFetch from 'node-fetch';
import type AbortController from 'abort-controller';

export default function fetchWrapper(
  /** The resource that you wish to fetch. */
  input: RequestInfo | URL,
  /** An object containing any custom settings. */
  init?: RequestInit
): Promise<Response>;

declare const fetch: typeof NodeFetch & {
  AbortController: typeof AbortController;
};
