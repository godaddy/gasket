import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { createServer } from 'http-proxy-3';
import http from 'node:http';
import https from 'node:https';
import { startProxyServer } from '../lib/actions.js';

vi.mock('http-proxy-3', () => ({ createServer: vi.fn() }));

describe('actions', () => {
  let mockGasket, mockExecWaterfall, mockLogger, mockCreateServer, mockListener;

  beforeEach(() => {
    mockExecWaterfall = vi.fn().mockResolvedValue({
      protocol: 'http',
      hostname: 'localhost',
      port: 8080
    });
    mockLogger = {
      error: vi.fn(),
      info: vi.fn()
    };
    mockCreateServer = {
      on: vi.fn().mockReturnThis(),
      listen: vi.fn()
    };
    vi.mocked(createServer).mockReturnValue(mockCreateServer);
    mockListener = { on: vi.fn().mockReturnThis(), listen: vi.fn(), address: vi.fn(), close: vi.fn() };
    vi.spyOn(http, 'createServer').mockReturnValue(mockListener);
    vi.spyOn(https, 'createServer').mockReturnValue(mockListener);

    mockGasket = {
      config: { httpsProxy: {} },
      execWaterfall: mockExecWaterfall,
      exec: vi.fn(),
      isReady: Promise.resolve(),
      logger: mockLogger
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('startProxyServer', () => {

    it('calls preboot', async () => {
      await startProxyServer(mockGasket);
      expect(mockGasket.exec).toHaveBeenCalledWith('prebootHttpsProxy');
    });

    it('waits for isReady before calling preboot', async () => {
      let readyResolved = false;
      mockGasket.isReady = new Promise(resolve => setTimeout(() => {
        readyResolved = true;
        resolve();
      }, 10));

      await startProxyServer(mockGasket);

      expect(readyResolved).toBe(true);
      expect(mockGasket.exec).toHaveBeenCalledWith('prebootHttpsProxy');
    });

    it('propagates errors from isReady', async () => {
      mockGasket.isReady = Promise.reject(new Error('fail'));

      await expect(startProxyServer(mockGasket)).rejects.toThrow('fail');
    });

    it('propagates errors from exec("preboot")', async () => {
      mockGasket.exec = vi.fn().mockRejectedValue(new Error('preboot fail'));

      await expect(startProxyServer(mockGasket)).rejects.toThrow('preboot fail');
    });

    it('calls exec("preboot") exactly once', async () => {
      await startProxyServer(mockGasket);

      expect(mockGasket.exec).toHaveBeenCalledTimes(1);
      expect(mockGasket.exec).toHaveBeenCalledWith('prebootHttpsProxy');
    });

    it('starts the proxy server with default options', async () => {
      await startProxyServer(mockGasket);

      expect(mockExecWaterfall).toHaveBeenCalledWith('httpsProxy', {});
      expect(createServer).toHaveBeenCalledWith({ proxyTimeout: 120000 });
      expect(mockCreateServer.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockListener.listen).toHaveBeenCalledWith(8080);
      expect(mockLogger.info).toHaveBeenCalledWith('Proxy server started: http://localhost:8080');
    });

    it('defaults proxyTimeout to 2 minutes', async () => {
      mockExecWaterfall.mockResolvedValue({ target: 'http://localhost:3000' });

      await startProxyServer(mockGasket);

      expect(createServer).toHaveBeenCalledWith({ target: 'http://localhost:3000', proxyTimeout: 120000 });
    });

    it('keeps a configured proxyTimeout', async () => {
      mockExecWaterfall.mockResolvedValue({ target: 'http://localhost:3000', proxyTimeout: 5000 });

      await startProxyServer(mockGasket);

      expect(createServer).toHaveBeenCalledWith({ target: 'http://localhost:3000', proxyTimeout: 5000 });
    });

    it('serves over https without passing ssl to http-proxy-3', async () => {
      const ssl = { key: 'k', cert: 'c' };
      mockExecWaterfall.mockResolvedValue({ port: 8443, ssl, target: 'http://localhost:3000' });

      await startProxyServer(mockGasket);

      expect(https.createServer).toHaveBeenCalledWith(ssl, expect.any(Function));
      expect(http.createServer).not.toHaveBeenCalled();
      expect(createServer).toHaveBeenCalledWith({ target: 'http://localhost:3000', proxyTimeout: 120000 });
    });

    it('listens for upgrades only when ws is set', async () => {
      await startProxyServer(mockGasket);
      expect(mockListener.on).not.toHaveBeenCalledWith('upgrade', expect.any(Function));

      mockExecWaterfall.mockResolvedValue({ ws: true, target: 'http://localhost:3000' });
      await startProxyServer(mockGasket);
      expect(mockListener.on).toHaveBeenCalledWith('upgrade', expect.any(Function));
    });

    it('logs an error if the proxy server fails to start', async () => {
      const error = new Error('Failed to start');
      mockCreateServer.on.mockImplementationOnce((event, handler) => {
        if (event === 'error') handler(error);
        return mockCreateServer;
      });

      await startProxyServer(mockGasket);

      expect(mockLogger.error).toHaveBeenCalledWith('Request failed to proxy:', error);
    });

    describe('error handler', () => {
      let onError;

      /**
       * Real ServerResponse with spied writes.
       * @param {boolean} headersSent - Whether headers were already sent
       * @returns {ServerResponse} The response
       */
      function makeResponse(headersSent) {
        const res = new ServerResponse(new IncomingMessage(new Socket()));
        vi.spyOn(res, 'headersSent', 'get').mockReturnValue(headersSent);
        vi.spyOn(res, 'writeHead').mockReturnThis();
        vi.spyOn(res, 'end').mockReturnThis();
        vi.spyOn(res, 'destroy').mockReturnThis();
        return res;
      }

      beforeEach(async () => {
        await startProxyServer(mockGasket);
        onError = mockCreateServer.on.mock.calls.find(([event]) => event === 'error')[1];
      });

      it('responds 502 when headers are not sent', () => {
        const res = makeResponse(false);
        onError(new Error('ECONNREFUSED'), {}, res);

        expect(res.writeHead).toHaveBeenCalledWith(502, { 'content-type': 'text/plain' });
        expect(res.end).toHaveBeenCalledWith('Bad Gateway');
        expect(res.destroy).not.toHaveBeenCalled();
      });

      it('destroys the response when headers were already sent', () => {
        const res = makeResponse(true);
        onError(new Error('ECONNRESET'), {}, res);

        expect(res.destroy).toHaveBeenCalled();
        expect(res.writeHead).not.toHaveBeenCalled();
      });

      it('destroys a websocket socket', () => {
        const socket = { destroy: vi.fn() };
        onError(new Error('ECONNREFUSED'), {}, socket);

        expect(socket.destroy).toHaveBeenCalled();
      });

      it('does not throw without a response', () => {
        expect(() => onError(new Error('boom'))).not.toThrow();
      });

      it('still logs the error', () => {
        const error = new Error('ECONNREFUSED');
        onError(error, {}, { destroy: vi.fn() });

        expect(mockLogger.error).toHaveBeenCalledWith('Request failed to proxy:', error);
      });
    });

    it('uses custom options from execWaterfall', async () => {
      mockExecWaterfall.mockResolvedValue({
        protocol: 'https',
        hostname: 'example.com',
        port: 9090,
        customOption: 'value'
      });

      await startProxyServer(mockGasket);

      expect(createServer).toHaveBeenCalledWith({ customOption: 'value', proxyTimeout: 120000 });
      expect(mockListener.listen).toHaveBeenCalledWith(9090);
      expect(mockLogger.info).toHaveBeenCalledWith('Proxy server started: https://example.com:9090');
    });

    it('handles missing protocol, hostname, and port in options', async () => {
      mockExecWaterfall.mockResolvedValue({ customOption: 'value' });

      await startProxyServer(mockGasket);

      expect(createServer).toHaveBeenCalledWith({ customOption: 'value', proxyTimeout: 120000 });
      expect(mockListener.listen).toHaveBeenCalledWith(8080);
      expect(mockLogger.info).toHaveBeenCalledWith('Proxy server started: http://localhost:8080');
    });
  });


});
