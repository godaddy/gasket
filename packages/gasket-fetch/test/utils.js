import assume from 'assume';
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
    [Request, Headers, Response].forEach(className => assume(className).to.be.a('function'));
    const req = new Request(API.GET, { method: 'GET' });
    const res = new Response();
    const headers = new Headers([['Content-Type', 'text/xml']]);

    assume(req).be.instanceof(Request);
    assume(res).be.instanceof(Response);
    assume(res.ok).to.equal(true);
    assume(res.status).to.equal(200);
    assume(headers).be.instanceof(Headers);
    assume(headers.get('Content-Type')).to.equal('text/xml');
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

    assume(res.ok).to.be.true();
    assume(res.status).to.equal(200);
    assume(headers.get('content-type')).to.equal('application/json; charset=utf-8');
    assume(body.id).equals(1);
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
        assume(res.ok).to.be.true();
        assume(res.status).to.equal(200);
        assume(headers.get('content-type')).to.equal('application/json');
        assume(headers.get('cache-control')).to.equal('max-age=0, no-cache, no-store');
        assume(body).to.deep.equal({ echo: [domain] });

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
      assume(error).to.be.instanceof(Error);
      assume(error.name).to.equal('AbortError');
    } finally {
      assume(res).to.be.falsy();
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
