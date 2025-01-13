/* globals RequestInit, RequestInfo */

export function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;

export default fetch;
