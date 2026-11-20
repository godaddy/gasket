import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
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
      expect(createServer).toHaveBeenCalledWith({});
      expect(mockCreateServer.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockListener.listen).toHaveBeenCalledWith(8080);
      expect(mockLogger.info).toHaveBeenCalledWith('Proxy server started: http://localhost:8080');
    });

    it('serves over https without passing ssl to http-proxy-3', async () => {
      const ssl = { key: 'k', cert: 'c' };
      mockExecWaterfall.mockResolvedValue({ port: 8443, ssl, target: 'http://localhost:3000' });

      await startProxyServer(mockGasket);

      expect(https.createServer).toHaveBeenCalledWith(ssl, expect.any(Function));
      expect(http.createServer).not.toHaveBeenCalled();
      expect(createServer).toHaveBeenCalledWith({ target: 'http://localhost:3000' });
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

    it('uses custom options from execWaterfall', async () => {
      mockExecWaterfall.mockResolvedValue({
        protocol: 'https',
        hostname: 'example.com',
        port: 9090,
        customOption: 'value'
      });

      await startProxyServer(mockGasket);

      expect(createServer).toHaveBeenCalledWith({ customOption: 'value' });
      expect(mockListener.listen).toHaveBeenCalledWith(9090);
      expect(mockLogger.info).toHaveBeenCalledWith('Proxy server started: https://example.com:9090');
    });

    it('handles missing protocol, hostname, and port in options', async () => {
      mockExecWaterfall.mockResolvedValue({ customOption: 'value' });

      await startProxyServer(mockGasket);

      expect(createServer).toHaveBeenCalledWith({ customOption: 'value' });
      expect(mockListener.listen).toHaveBeenCalledWith(8080);
      expect(mockLogger.info).toHaveBeenCalledWith('Proxy server started: http://localhost:8080');
    });
  });


});
