/* global RequestInit, RequestInfo */

/**
 * Definition for browser fetch
 */
export function fetch(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response>;

export default fetch;
