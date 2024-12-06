import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import proxy from 'http-proxy';
import { startProxyServer } from '../lib/actions';

describe('startProxyServer', () => {
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
      logger: mockLogger
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

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