import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import net from 'node:net';
import tls from 'node:tls';
import { generate } from 'selfsigned';
import { startProxy } from '../lib/utils.js';

const get = (headers = '', path = '/x') => `GET ${path} HTTP/1.1\r\nHost: localhost\r\n${headers}Connection: close\r\n\r\n`;

/**
 * Resolve once a TCP connection to the port succeeds.
 * @param {number} port - Port to poll
 * @returns {Promise<void>} Resolves when the port accepts connections
 */
async function listening(port) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const ok = await new Promise((resolve) => {
      const sock = net.connect(port, '127.0.0.1', () => {
        sock.destroy();
        resolve(true);
      }).on('error', () => resolve(false));
    });
    if (ok) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`port ${port} never accepted connections`);
}

/** @returns {Promise<number>} An unused local port */
function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer().listen(0, () => {
      const { port } = /** @type {net.AddressInfo} */ (srv.address());
      srv.close(() => resolve(port));
    }).on('error', reject);
  });
}

/**
 * Write a raw request and resolve with the first response line.
 * @param {number} port - Proxy port
 * @param {string} payload - Raw HTTP request
 * @returns {Promise<string>} First response line, EMPTY, ERR, or TIMEOUT
 */
function rawRequest(port, payload) {
  return new Promise((resolve) => {
    const sock = net.connect(port, '127.0.0.1');
    let data = '';
    sock.setTimeout(2000, () => {
      sock.destroy();
      resolve('TIMEOUT');
    });
    sock.on('data', (d) => { data += d; });
    let failed = false;
    sock.on('error', () => { failed = true; });
    sock.on('close', () => resolve(failed && !data ? 'ERR' : data.split('\r\n')[0] || 'EMPTY'));
    sock.write(payload);
  });
}

describe('startProxy', () => {
  let target, targetPort, lastUrl, ssl;
  const logger = { info: vi.fn(), error: vi.fn() };
  const proxies = [];

  /**
   * Start the dev proxy against the test target.
   * @param {object} [proxyTarget] - Proxy target
   * @param {object} [extra] - Other devProxy options
   * @returns {Promise<number>} The proxy's port
   */
  async function proxyTo(proxyTarget = { host: 'localhost', port: targetPort }, extra = {}) {
    const port = await freePort();
    proxies.push(startProxy({ port, target: proxyTarget, ...extra }, logger));
    await listening(port);
    return port;
  }

  beforeAll(async () => {
    const pems = await generate([{ name: 'commonName', value: 'localhost' }], { days: 1, keySize: 2048 });
    ssl = { key: pems.private, cert: pems.cert };

    target = http.createServer((req, res) => {
      lastUrl = req.url;
      if (req.url === '/die') {
        res.writeHead(200, { 'content-length': '100' });
        res.write('partial');
        setTimeout(() => res.socket.destroy(), 20);
        return;
      }
      res.end('ok');
    });
    await new Promise((resolve) => target.listen(0, resolve));
    targetPort = target.address().port;
  });

  afterAll(async () => {
    await Promise.all(proxies.map((proxy) => new Promise((resolve) => proxy.close(resolve))));
    await new Promise((resolve) => target.close(resolve));
  });

  describe('lifecycle', () => {
    it('returns a server that close() stops', async () => {
      const port = await freePort();
      const proxy = startProxy({ port, target: { host: 'localhost', port: targetPort } }, logger);
      await listening(port);
      await new Promise((resolve) => proxy.close(resolve));

      expect(await rawRequest(port, get())).toBe('ERR');
    });

    it('logs a port conflict instead of crashing', async () => {
      const blocker = net.createServer();
      await new Promise((resolve) => blocker.listen(0, resolve));
      const errorLogger = { info: vi.fn(), error: vi.fn() };

      proxies.push(startProxy({ port: blocker.address().port, target: { host: 'localhost', port: targetPort } }, errorLogger));
      await vi.waitFor(() => expect(errorLogger.error).toHaveBeenCalled());

      expect(errorLogger.error.mock.calls[0][1].code).toBe('EADDRINUSE');
      await new Promise((resolve) => blocker.close(resolve));
    });

    it('negotiates only HTTP/1.1 over TLS', async () => {
      const port = await proxyTo({ host: 'localhost', port: targetPort }, { ssl: { ...ssl } });
      const protocol = await new Promise((resolve) => {
        const sock = tls.connect({ port, host: '127.0.0.1', rejectUnauthorized: false, ALPNProtocols: ['h2', 'http/1.1'] },
          () => {
            resolve(sock.alpnProtocol);
            sock.destroy();
          });
        sock.on('error', () => resolve('ERROR'));
      });

      expect(protocol).toBe('http/1.1');
    });
  });

  describe('malformed requests', () => {
    it('survives a request with a Trailer header', async () => {
      const port = await proxyTo();

      expect(await rawRequest(port, get('Trailer: x\r\n'))).toBe('HTTP/1.1 200 OK');
      expect(await rawRequest(port, get())).toBe('HTTP/1.1 200 OK');
    });

    it.each([['http://[/'], ['http://a:99999/'], ['http://%zz/']])('responds 400 to the malformed URL %s', async (url) => {
      const port = await proxyTo();

      expect(await rawRequest(port, get('', url))).toBe('HTTP/1.1 400 Bad Request');
      expect(await rawRequest(port, get())).toBe('HTTP/1.1 200 OK');
    });
  });

  describe('target failures', () => {
    it('responds 502 when the target is down', async () => {
      const port = await proxyTo({ host: 'localhost', port: await freePort() });

      expect(await rawRequest(port, get())).toBe('HTTP/1.1 502 Bad Gateway');
    });

    it('responds 502 when the target never answers', async () => {
      // Read and discard the request without answering, so the socket can close after the timeout.
      const silent = net.createServer((socket) => socket.resume());
      await new Promise((resolve) => silent.listen(0, resolve));
      const port = await proxyTo({ host: 'localhost', port: silent.address().port }, { proxyTimeout: 200 });

      expect(await rawRequest(port, get())).toBe('HTTP/1.1 502 Bad Gateway');
      await new Promise((resolve) => silent.close(resolve));
    });

    it('closes the client socket when the target dies mid-response', async () => {
      const port = await proxyTo();
      const start = Date.now();

      await rawRequest(port, get('', '/die'));
      expect(Date.now() - start).toBeLessThan(1000);
    });
  });

  describe('target config', () => {
    it('prepends the path of an object target', async () => {
      const port = await proxyTo({ host: 'localhost', port: targetPort, path: '/base' });

      expect(await rawRequest(port, get())).toBe('HTTP/1.1 200 OK');
      expect(lastUrl).toBe('/base/x');
    });

    it('keeps every query separator of an object target path', async () => {
      const port = await proxyTo({ host: 'localhost', port: targetPort, path: '/base?a=1?b=2' });

      expect(await rawRequest(port, get())).toBe('HTTP/1.1 200 OK');
      expect(lastUrl).toBe('/base/x?a=1?b=2');
    });

    it.each([
      ['/new', '/new/x'],
      ['/new?fresh=1', '/new/x?fresh=1'],
      ['', '/x']
    ])('uses an overridden path %j on a url.parse() target', async (path, expected) => {
      // The fields url.parse() returns, which http-proxy accepted as a target.
      const parsed = { protocol: 'http:', host: `localhost:${targetPort}`, hostname: 'localhost', port: String(targetPort),
        pathname: '/old', search: '?stale=1', query: 'stale=1', path: '/old?stale=1' };
      const port = await proxyTo({ ...parsed, path });

      expect(await rawRequest(port, get())).toBe('HTTP/1.1 200 OK');
      expect(lastUrl).toBe(expected);
    });
  });
});
