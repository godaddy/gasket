async function fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;

export default fetch
export { fetch }

type GasketHeaders = Headers;
export { GasketHeaders as Headers }

type GasketRequest = Request;
export { GasketRequest as Request }

type GasketResponse = Response;
export { GasketResponse as Response }

type GasketAbortController = AbortController;
export { GasketAbortController as AbortController }
