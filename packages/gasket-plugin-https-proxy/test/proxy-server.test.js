import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import net from 'node:net';
import tls from 'node:tls';
import { generate } from 'selfsigned';
import { startProxyServer } from '../lib/actions.js';

const CONTROL = 'GET / HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n';
const get = (headers) => `GET / HTTP/1.1\r\nHost: localhost\r\n${headers}Connection: close\r\n\r\n`;
const absolute = (url) => `GET ${url} HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n`;

const cases = [
  ['Trailer: x', get('Trailer: x\r\n'), 'HTTP/1.1 200 OK'],
  ['mixed-case trailer', get('TrAiLeR: x\r\n'), 'HTTP/1.1 200 OK'],
  [
    'trailer on ws upgrade',
    'GET / HTTP/1.1\r\nHost: localhost\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' +
      'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nSec-WebSocket-Version: 13\r\nTrailer: x\r\n\r\n',
    'HTTP/1.1 200 OK'
  ],
  ['invalid absolute-form URL', absolute('http://[/'), 'HTTP/1.1 400 Bad Request'],
  ['out-of-range port in URL', absolute('http://a:99999/'), 'HTTP/1.1 400 Bad Request'],
  ['bad percent-encoding in URL host', absolute('http://%zz/'), 'HTTP/1.1 400 Bad Request'],
  [
    'invalid URL on ws upgrade',
    'GET http://[::1/x HTTP/1.1\r\nHost: localhost\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' +
      'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nSec-WebSocket-Version: 13\r\n\r\n',
    'EMPTY'
  ],
  [
    'duplicate content-length',
    'POST / HTTP/1.1\r\nHost: localhost\r\nContent-Length: 1\r\nContent-Length: 2\r\nConnection: close\r\n\r\nab',
    'HTTP/1.1 400 Bad Request'
  ]
];

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
 * @param {{ tls?: boolean }} [opts] - Connect over TLS
 * @returns {Promise<string>} First response line, EMPTY, or TIMEOUT
 */
function rawRequest(port, payload, opts = {}) {
  return new Promise((resolve) => {
    const sock = opts.tls
      ? tls.connect({ port, host: '127.0.0.1', rejectUnauthorized: false })
      : net.connect(port, '127.0.0.1');
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

describe('proxy server', () => {
  let target, targetPort, ssl, lastUrl;
  const servers = [];

  /**
   * Start the proxy through the real startProxyServer action.
   * @param {object} [overrides] - httpsProxy config overrides
   * @param {object} [base] - httpsProxy config to start from
   * @returns {Promise<{ port: number, server: any }>} The proxy's port and server
   */
  async function startProxy(overrides = {}, base = { target: { host: 'localhost', port: targetPort } }) {
    const port = await freePort();
    const gasket = {
      isReady: Promise.resolve(),
      exec: vi.fn(),
      execWaterfall: (_, config) => config,
      logger: { info: vi.fn(), error: vi.fn() },
      config: { httpsProxy: { ...base, port, ...overrides } }
    };
    const server = await startProxyServer(gasket);
    servers.push(server);
    await listening(port);
    return { port, server };
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
    servers.forEach((s) => s.close(() => {}));
    await new Promise((resolve) => target.close(resolve));
  });

  describe.each([['http'], ['https']])('malformed requests over %s', (protocol) => {
    const useTls = protocol === 'https';

    // Each proxy gets its own ssl copy: http-proxy builds outgoing requests on options.ssl and overwrites it.
    it.each(cases)('survives %s', async (_, payload, expected) => {
      const { port } = await startProxy({ ws: true, ...(useTls && { ssl: { ...ssl } }) });

      expect(await rawRequest(port, payload, { tls: useTls })).toBe(expected);
      expect(await rawRequest(port, CONTROL, { tls: useTls })).toBe('HTTP/1.1 200 OK');
    });
  });

  describe('listener', () => {
    it('negotiates only HTTP/1.1 over TLS', async () => {
      const { port } = await startProxy({ ssl: { ...ssl } });
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

    it('closes the client socket when the target dies mid-response', async () => {
      const { port } = await startProxy();
      const start = Date.now();

      await rawRequest(port, 'GET /die HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n');
      expect(Date.now() - start).toBeLessThan(1000);
    });

    it('returns a server that close() stops', async () => {
      const { port, server } = await startProxy();
      await new Promise((resolve) => server.close(resolve));

      expect(await rawRequest(port, CONTROL)).toBe('ERR');
    });
  });

  describe('startup', () => {
    it('logs a port conflict instead of crashing', async () => {
      const blocker = net.createServer();
      await new Promise((resolve) => blocker.listen(0, resolve));
      const port = blocker.address().port;
      const logger = { info: vi.fn(), error: vi.fn() };

      const server = await startProxyServer({
        isReady: Promise.resolve(),
        exec: vi.fn(),
        execWaterfall: (_, config) => config,
        logger,
        config: { httpsProxy: { port, target: { host: 'localhost', port: targetPort } } }
      });
      await vi.waitFor(() => expect(logger.error).toHaveBeenCalled());

      expect(logger.error.mock.calls[0][1].code).toBe('EADDRINUSE');
      server.close(() => {});
      await new Promise((resolve) => blocker.close(resolve));
    });
  });

  describe('target failures', () => {
    it('responds 502 when the target never answers', async () => {
      // Read and discard the request without answering, so the socket can close after the timeout.
      const silent = net.createServer((socket) => socket.resume());
      await new Promise((resolve) => silent.listen(0, resolve));
      const { port } = await startProxy({ proxyTimeout: 200 }, { target: { host: 'localhost', port: silent.address().port } });

      expect(await rawRequest(port, CONTROL)).toBe('HTTP/1.1 502 Bad Gateway');
      await new Promise((resolve) => silent.close(resolve));
    });

    it('responds 502 when the target is down', async () => {
      const deadPort = await freePort();
      const { port } = await startProxy({}, { target: { host: 'localhost', port: deadPort } });

      expect(await rawRequest(port, CONTROL)).toBe('HTTP/1.1 502 Bad Gateway');
    });

    it('closes the socket when a websocket target is down', async () => {
      const deadPort = await freePort();
      const { port } = await startProxy({ ws: true }, { target: { host: 'localhost', port: deadPort } });
      const upgrade = 'GET / HTTP/1.1\r\nHost: localhost\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' +
        'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nSec-WebSocket-Version: 13\r\n\r\n';

      expect(await rawRequest(port, upgrade)).toBe('EMPTY');
    });
  });

  describe('target config', () => {
    const getX = 'GET /x HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n';

    it('prepends the path of an object target', async () => {
      const { port } = await startProxy({}, { target: { host: 'localhost', port: targetPort, path: '/base' } });

      expect(await rawRequest(port, getX)).toBe('HTTP/1.1 200 OK');
      expect(lastUrl).toBe('/base/x');
    });

    it('keeps every query separator of an object target path', async () => {
      const { port } = await startProxy({}, { target: { host: 'localhost', port: targetPort, path: '/base?a=1?b=2' } });

      expect(await rawRequest(port, getX)).toBe('HTTP/1.1 200 OK');
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
      const { port } = await startProxy({}, { target: { ...parsed, path } });

      expect(await rawRequest(port, getX)).toBe('HTTP/1.1 200 OK');
      expect(lastUrl).toBe(expected);
    });

    it('prepends the path of a string target', async () => {
      const { port } = await startProxy({}, { target: `http://localhost:${targetPort}/base` });

      expect(await rawRequest(port, getX)).toBe('HTTP/1.1 200 OK');
      expect(lastUrl).toBe('/base/x');
    });
  });
});
