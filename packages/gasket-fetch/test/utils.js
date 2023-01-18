import { createServer, closeServer } from './test-server';

const port = 9090;
const domain = 'testing-fetch.com';
const API = {
  POST: `http://localhost:${ port }`,
  GET: 'https://jsonplaceholder.typicode.com/todos/1'
};

/**
 * Assert fetch API compliant classes.
 *
 * @param {Function} Request constructor for Request class.
 * @param {Function} Headers constructor for Headers class.
 * @param {Function} Response constructor for Response class.
 * @returns {Function} runnable test descriptor.
 * @public
 */
function assertExports(Request, Headers, Response) {
  return () => {
    [Request, Headers, Response].forEach(className => expect(className).toEqual(expect.any(Function)));
    const req = new Request(API.GET, { method: 'GET' });
    const res = new Response();
    const headers = new Headers([['Content-Type', 'text/xml']]);

    expect(req).toBeInstanceOf(Request);
    expect(res).toBeInstanceOf(Response);
    expect(res.ok).toEqual(true);
    expect(res.status).toEqual(200);
    expect(headers).toBeInstanceOf(Headers);
    expect(headers.get('Content-Type')).toEqual('text/xml');
  };
}

/**
 * Assert fetch API executing GET request.
 *
 * @async
 * @param {Function} fetch implementation of fetch.
 * @returns {Function} runnable test descriptor.
 * @public
 */
function assertGet(fetch) {
  return async () => {
    const res = await fetch(API.GET);
    const body = await res.json();
    const headers = res.headers;

    expect(res.ok).toEqual(true);
    expect(res.status).toEqual(200);
    expect(headers.get('content-type')).toEqual('application/json; charset=utf-8');
    expect(body.id).toEqual(1);
  };
}

/**
 * Assert fetch API executing POST request.
 *
 * @async
 * @param {Function} fetch implementation of fetch.
 * @returns {Function} runnable test descriptor.
 * @public
 */
function assertPost(fetch) {
  return async () => {
    const server = createServer();
    server.listen(port, async () => {
      try {
        const res = await fetch(API.POST, {
          method: 'POST',
          body: JSON.stringify([domain])
        });

        const body = await res.json();
        const headers = res.headers;
        expect(res.ok).toEqual(true);
        expect(res.status).toEqual(200);
        expect(headers.get('content-type')).toEqual('application/json');
        expect(headers.get('cache-control')).toEqual('max-age=0, no-cache, no-store');
        expect(body).toEqual({ echo: [domain] });

        closeServer(server);
      } catch (error) {
        console.error(error); // eslint-disable-line no-console
      } finally {
        closeServer(server);
      }
    });
  };
}

/**
 * Assert AbortController aborting fetch requests.
 *
 * @async
 * @param {Function} fetch implementation of fetch.
 * @param {Function} AbortController constructor for aborting fetch request.
 * @returns {Function} runnable test descriptor.
 * @public
 */
function assertAbort(fetch, AbortController) {
  return async () => {
    const controller = new AbortController();
    const timeout = setTimeout(controller.abort.bind(controller), 10);
    let res;

    try {
      res = await fetch(API.GET, { signal: controller.signal });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toEqual('AbortError');
    } finally {
      expect(res).toBeFalsy();
      clearTimeout(timeout);
    }
  };
}

module.exports = {
  assertGet,
  assertPost,
  assertExports,
  assertAbort
};
