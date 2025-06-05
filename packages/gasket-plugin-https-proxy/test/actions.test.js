import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import proxy from 'http-proxy';
import { startProxyServer, prepareProxyServer } from '../lib/actions.js';

describe('actions', () => {
  let mockGasket, mockExecWaterfall, mockLogger, mockCreateServer;

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
    vi.spyOn(proxy, 'createServer').mockReturnValue(mockCreateServer);

    mockGasket = {
      config: { httpsProxy: {} },
      execWaterfall: mockExecWaterfall,
      exec: vi.fn(),
      isReady: Promise.resolve(),
      logger: mockLogger,
      actions: { prepareProxyServer: vi.fn().mockResolvedValue() }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('startProxyServer', () => {

    it('starts the proxy server with default options', async () => {
      await startProxyServer(mockGasket);

      expect(mockExecWaterfall).toHaveBeenCalledWith('httpsProxy', {});
      expect(proxy.createServer).toHaveBeenCalledWith({});
      expect(mockCreateServer.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockCreateServer.listen).toHaveBeenCalledWith(8080);
      expect(mockLogger.info).toHaveBeenCalledWith('Proxy server started: http://localhost:8080');
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

      expect(proxy.createServer).toHaveBeenCalledWith({ customOption: 'value' });
      expect(mockCreateServer.listen).toHaveBeenCalledWith(9090);
      expect(mockLogger.info).toHaveBeenCalledWith('Proxy server started: https://example.com:9090');
    });

    it('handles missing protocol, hostname, and port in options', async () => {
      mockExecWaterfall.mockResolvedValue({ customOption: 'value' });

      await startProxyServer(mockGasket);

      expect(proxy.createServer).toHaveBeenCalledWith({ customOption: 'value' });
      expect(mockCreateServer.listen).toHaveBeenCalledWith(8080);
      expect(mockLogger.info).toHaveBeenCalledWith('Proxy server started: http://localhost:8080');
    });
  });

  describe('prepareProxyServer', () => {

    it('is exported', () => {
      expect(prepareProxyServer).toBeInstanceOf(Function);
    });

    it('calls preboot', async () => {
      await prepareProxyServer(mockGasket);
      expect(mockGasket.exec).toHaveBeenCalledWith('preboot');
    });

    it('waits for isReady before calling preboot', async () => {
      let readyResolved = false;
      const isReady = new Promise(resolve => setTimeout(() => {
        readyResolved = true;
        resolve();
      }, 10));
      const exec = vi.fn();
      const gasket = { exec, isReady };

      await prepareProxyServer(gasket);

      expect(readyResolved).toBe(true);
      expect(exec).toHaveBeenCalledWith('preboot');
    });

    it('propagates errors from isReady', async () => {
      const exec = vi.fn();
      const isReady = Promise.reject(new Error('fail'));
      const gasket = { exec, isReady };

      await expect(prepareProxyServer(gasket)).rejects.toThrow('fail');
    });

    it('propagates errors from exec("preboot")', async () => {
      const exec = vi.fn().mockRejectedValue(new Error('preboot fail'));
      const isReady = Promise.resolve();
      const gasket = { exec, isReady };

      await expect(prepareProxyServer(gasket)).rejects.toThrow('preboot fail');
    });

    it('calls exec("preboot") exactly once', async () => {
      const exec = vi.fn();
      const isReady = Promise.resolve();
      const gasket = { exec, isReady };

      await prepareProxyServer(gasket);

      expect(exec).toHaveBeenCalledTimes(1);
      expect(exec).toHaveBeenCalledWith('preboot');
    });
  });

});
