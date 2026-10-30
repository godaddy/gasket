import { describe, it, expect, afterEach } from 'vitest';
import http2 from 'node:http2';
import { createExpressAdapter } from '../lib/adapters/index.js';

/**
 * GET / over HTTP/2 and collect the response.
 * @param {number} port - Server port
 * @returns {Promise<{ status: number, body: string }>} Response status and body
 */
async function http2Get(port) {
  const client = http2.connect(`http://127.0.0.1:${port}`);
  try {
    return await new Promise((resolve, reject) => {
      client.on('error', reject);
      const req = client.request({ ':path': '/', 'cookie': 'a=1' });
      req.setTimeout(2000, () => reject(new Error('HTTP/2 request timed out')));
      let status;
      let body = '';
      req.setEncoding('utf8');
      req.on('response', (headers) => { status = headers[':status']; });
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => resolve({ status, body }));
      req.on('error', reject);
      req.end();
    });
  } finally {
    // An open session keeps server.close() in afterEach from resolving.
    client.destroy();
  }
}

describe('createExpressAdapter (installed Express)', () => {
  let server;

  afterEach(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    server = null;
  });

  it('creates a working app on the installed Express major', async () => {
    const app = createExpressAdapter().createInstance({});
    app.get('/', (req, res) => res.send(`hello ${req.cookies.a}`));
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));

    const res = await fetch(`http://127.0.0.1:${server.address().port}/`, {
      headers: { cookie: 'a=1' }
    });

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('hello 1');
  });

  it('serves HTTP/2 requests on the installed Express major', async () => {
    const app = createExpressAdapter().createInstance({ http2: true });
    app.get('/', (req, res) => res.send(`hello ${req.cookies.a}`));
    server = http2.createServer(app).listen(0);
    await new Promise((resolve) => server.once('listening', resolve));

    const res = await http2Get(server.address().port);

    expect(res.status).toBe(200);
    expect(res.body).toBe('hello 1');
  });
});
