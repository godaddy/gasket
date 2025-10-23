import { describe, it, expect, beforeEach, vi } from 'vitest';
import errs from 'errs';

const mockCreateServersModule = vi.fn().mockImplementation((server, fn) => fn(null, server));
const mockHealthCheckError = vi.fn();
const mockCreateTerminus = vi.fn();
const mockDebugStub = vi.fn();
const mockProxyCreateServer = vi.fn().mockReturnValue({
  on: vi.fn().mockReturnValue({
    listen: vi.fn()
  })
});
const mockExec = vi.fn();

vi.mock('create-servers', () => ({
  default: mockCreateServersModule
}));
vi.mock('diagnostics', () => ({
  default: () => mockDebugStub
}));
vi.mock('@godaddy/terminus', () => ({
  createTerminus: mockCreateTerminus,
  HealthCheckError: mockHealthCheckError
}));
vi.mock('http-proxy', () => ({
  default: {
    createServer: mockProxyCreateServer
  }
}));

const { startServer } = await import('../lib/actions.js');

describe('actions', () => {
  let gasketAPI, handler;

  beforeEach(() => {
    vi.clearAllMocks();
    gasketAPI = {
      execWaterfall: vi.fn().mockImplementation((arg1, arg2) => Promise.resolve(arg2)),
      exec: mockExec,
      traceRoot: vi.fn().mockReturnThis(),
      config: {},
      logger: {
        info: vi.fn(),
        error: vi.fn()
      }
    };
    handler = vi.fn().mockImplementation(fn => fn());
    gasketAPI.exec.mockResolvedValue([handler]);
  });


  it('should export startServer', () => {
    expect(startServer).toBeInstanceOf(Function);
  });

  describe('devProxy', () => {
    beforeEach(() => {
      gasketAPI.config = {
        devProxy: {
          target: {
            host: 'localhost',
            port: 5000
          }
        }
      };
    });

    it('lifecycle is called', async () => {
      await startServer(gasketAPI);
      expect(gasketAPI.execWaterfall).toHaveBeenCalledWith('devProxy', gasketAPI.config.devProxy);
    });

    it('creates proxy server when configured', async () => {
      await startServer(gasketAPI);
      expect(mockProxyCreateServer).toHaveBeenCalledWith(gasketAPI.config.devProxy);
    });

    it('sets default values for proxy server', async () => {
      await startServer(gasketAPI);
      expect(mockProxyCreateServer).toHaveBeenCalledWith({
        target: {
          host: 'localhost',
          port: 5000
        }
      });
    });

    it('does not create proxy server when not configured', async () => {
      gasketAPI.config = {};
      await startServer(gasketAPI);
      expect(gasketAPI.execWaterfall).not.toHaveBeenCalledWith('devProxy');
      expect(mockProxyCreateServer).not.toHaveBeenCalled();
    });
  });

  it('does not create an HTTP server if `http` is `null`', async () => {
    gasketAPI.config = {
      hostname: 'local.gasket.godaddy.com',
      http: null,
      https: { port: 3000 }
    };

    await startServer(gasketAPI);
    const createServerOpts = mockCreateServersModule.mock.calls[mockCreateServersModule.mock.calls.length - 1][0];
    expect(createServerOpts).not.toHaveProperty('http');
    expect(createServerOpts).toHaveProperty('https');
    expect(createServerOpts).not.toHaveProperty('http2');
  });

  it('does not create an HTTPS server if `https` is `null`', async () => {
    gasketAPI.config = {
      hostname: 'local.gasket.godaddy.com',
      http: 8080,
      https: null
    };

    await startServer(gasketAPI);

    const createServerOpts = mockCreateServersModule.mock.calls[mockCreateServersModule.mock.calls.length - 1][0];
    expect(createServerOpts).toHaveProperty('http');
    expect(createServerOpts).not.toHaveProperty('https');
    expect(createServerOpts).not.toHaveProperty('http2');
  });

  it('can create an http2 server', async () => {
    gasketAPI.config = {
      hostname: 'local.gasket.godaddy.com',
      http2: 8080
    };

    await startServer(gasketAPI);

    const createServerOpts = mockCreateServersModule.mock.calls[mockCreateServersModule.mock.calls.length - 1][0];
    expect(createServerOpts).not.toHaveProperty('http');
    expect(createServerOpts).not.toHaveProperty('https');
    expect(createServerOpts).toHaveProperty('http2');
  });

  it('defaults HTTP server to port 80 if neither `http` or `https` or `http2`', async () => {
    gasketAPI.config = {};

    await startServer(gasketAPI);

    const createServerOpts = mockCreateServersModule.mock.calls[mockCreateServersModule.mock.calls.length - 1][0];
    expect(createServerOpts).toHaveProperty('http', 80);
    expect(createServerOpts).not.toHaveProperty('https');
  });

  it('defaults HTTP server to port 8080 if env is local', async () => {
    gasketAPI.config = {
      env: 'local'
    };

    await startServer(gasketAPI);

    const createServerOpts = mockCreateServersModule.mock.calls[mockCreateServersModule.mock.calls.length - 1][0];
    expect(createServerOpts).toHaveProperty('http', 8080);
    expect(createServerOpts).not.toHaveProperty('https');
  });

  it('does not defaults HTTP port if configured', async () => {
    gasketAPI.config = {
      env: 'local',
      http: 1234
    };

    await startServer(gasketAPI);

    const createServerOpts = mockCreateServersModule.mock.calls[mockCreateServersModule.mock.calls.length - 1][0];
    expect(createServerOpts).toHaveProperty('http', 1234);
    expect(createServerOpts).not.toHaveProperty('https');
  });

  describe('success message', () => {
    beforeEach(() => {
      gasketAPI.execWaterfall.mockImplementation(() => Promise.resolve(gasketAPI.config));
    });

    it('is output when the servers have been started', async () => {
      gasketAPI.config = {
        hostname: 'local.gasket.godaddy.com',
        http: 8080
      };

      await startServer(gasketAPI);
      const logMessages = gasketAPI.logger.info.mock.calls.flat().map(message => message);

      expect(logMessages[0]).toMatch(/http:\/\/local\.gasket\.godaddy\.com:8080\//);
    });

    it('readable http log when port and hostname not configured', async () => {
      gasketAPI.config = {
        http: true
      };

      await startServer(gasketAPI);

      const logMessages = gasketAPI.logger.info.mock.calls.flat().map(message => message);
      expect(logMessages[0]).toMatch(/http:\/\/localhost\//);
    });

    it('contains the configured hostname', async () => {
      gasketAPI.config = {
        hostname: 'myapp.godaddy.com',
        https: { port: 8443 }
      };

      await startServer(gasketAPI);

      const logMessages = gasketAPI.logger.info.mock.calls.flat().map(message => message);
      expect(logMessages[0]).toMatch(/https:\/\/myapp\.godaddy\.com:8443\//);
    });

    it('contains the configured hostname for http2', async () => {
      gasketAPI.config = {
        hostname: 'myapp.godaddy.com',
        http2: { port: 8443 }
      };

      await startServer(gasketAPI);

      const logMessages = gasketAPI.logger.info.mock.calls.flat().map(message => message);
      expect(logMessages[0]).toMatch(/https:\/\/myapp\.godaddy\.com:8443\//);
    });

    it('contains the configured port numbers', async () => {
      gasketAPI.config = {
        hostname: 'local.gasket.godaddy.com',
        https: { port: 3000 }
      };

      await startServer(gasketAPI);

      const logMessages = gasketAPI.logger.info.mock.calls.flat().map(message => message);
      expect(logMessages[0]).toMatch(/https:\/\/local\.gasket\.godaddy\.com:3000\//);
    });

    it('readable https log when port and hostname not configured', async () => {
      gasketAPI.config = {
        https: { }
      };

      await startServer(gasketAPI);

      const logMessages = gasketAPI.logger.info.mock.calls.flat().map(message => message);
      expect(logMessages[0]).toMatch(/https:\/\/localhost\//);
    });

    it('uses config from createServers lifecycle', async () => {
      gasketAPI.config = {
        hostname: 'local.gasket.godaddy.com',
        http: 3000
      };

      gasketAPI.execWaterfall.mockImplementation(() => Promise.resolve({ hostname: 'bogus.com', http: 9000 }));

      await startServer(gasketAPI);

      const logMessages = gasketAPI.logger.info.mock.calls[0].flat().map(message => message);
      expect(logMessages[0]).toMatch(/http:\/\/bogus\.com:9000\//);
    });
  });

  it('rejects with an Error on failure', async () => {
    mockCreateServersModule.mockImplementation((_, fn) => {
      const httpsError = errs.create({
        message: 'Cert file not found',
        code: 'something'
      });

      fn(
        errs.create({
          message: httpsError.message,
          https: httpsError
        })
      );
    });

    await startServer(gasketAPI);

    const expected = 'Failed to start the web servers: Cert file not found';
    expect(gasketAPI.logger.error).toHaveBeenCalledWith(expected);
    expect(mockDebugStub.mock.calls[0][0].message).toEqual(expected);
    expect(mockDebugStub.mock.calls[0][1].https.message).toEqual('Cert file not found');
  });

  it('rejects with an Error about ports on failure (with http)', async () => {
    mockCreateServersModule.mockImplementation((_, fn) => fn(
      errs.create({
        http: {
          code: 'EADDRINUSE'
        }
      })
    ));


    await startServer(gasketAPI);

    const expected = 'Port is already in use';
    expect(gasketAPI.logger.error).toHaveBeenCalledWith(expect.stringContaining(expected));
    expect(mockDebugStub.mock.calls[0][0].message).toMatch(expected);
    expect(mockDebugStub.mock.calls[0][1].http.code).toEqual('EADDRINUSE');
  });

  it('rejects with an Error about ports on failure (with https)', async () => {
    mockCreateServersModule.mockImplementation((_, fn) => fn(
      errs.create({
        https: {
          code: 'EADDRINUSE'
        }
      })
    ));

    await startServer(gasketAPI);

    expect(mockDebugStub.mock.calls[0][0].message).toMatch('Port is already in use');
    expect(mockDebugStub.mock.calls[0][1].https.code).toEqual('EADDRINUSE');
  });

  it('rejects with an Error about ports on failure (with http2)', async () => {
    mockCreateServersModule.mockImplementation((_, fn) => fn(
      errs.create({
        http2: {
          code: 'EADDRINUSE'
        }
      })
    ));

    await startServer(gasketAPI);

    expect(mockDebugStub.mock.calls[0][0].message).toMatch('Port is already in use');
    expect(mockDebugStub.mock.calls[0][1].http2.code).toEqual('EADDRINUSE');
  });

  it('calls preboot', async () => {
    await startServer(gasketAPI);
    expect(gasketAPI.exec).toHaveBeenCalledWith('preboot');
  });

  it('waits for isReady before calling preboot', async () => {
    let readyResolved = false;
    gasketAPI.isReady = new Promise(resolve => setTimeout(() => {
      readyResolved = true;
      resolve();
    }, 10));

    await startServer(gasketAPI);

    expect(readyResolved).toBe(true);
    expect(gasketAPI.exec).toHaveBeenCalledWith('preboot');
  });

  it('calls exec("preboot") exactly once', async () => {
    await startServer(gasketAPI);
    expect(gasketAPI.exec).toHaveBeenCalledWith('preboot');
  });

  it('propagates errors from isReady', async () => {
    gasketAPI.isReady = Promise.reject(new Error('fail'));
    await expect(startServer(gasketAPI)).rejects.toThrow('fail');
  });

  it('propagates errors from exec("preboot")', async () => {
    gasketAPI.exec = vi.fn().mockRejectedValue(new Error('preboot fail'));
    await expect(startServer(gasketAPI)).rejects.toThrow('preboot fail');
  });

  describe('terminus', function () {
    const aServer = {};
    const servers = { http: aServer };

    beforeEach(function () {
      mockCreateServersModule.mockImplementation((_, fn) => fn(null, servers));
    });

    it('passes each created server to terminus', async () => {
      await startServer(gasketAPI);

      expect(mockCreateTerminus).toHaveBeenCalledTimes(1);
      expect(mockCreateTerminus.mock.calls[0][0]).toEqual(aServer);
    });

    it('supports multiple servers as object', async () => {
      mockCreateServersModule.mockImplementation((_, fn) => fn(null, { https: aServer, http: aServer }));

      await startServer(gasketAPI);
      expect(mockCreateTerminus).toHaveBeenCalledTimes(2);
      expect(mockCreateTerminus.mock.calls[0][0]).toEqual(aServer);
    });

    it('supports multiple servers under object properties', async () => {
      mockCreateServersModule.mockImplementation((_, fn) => fn(null, { https: [aServer, aServer], http: [aServer, aServer] }));

      await startServer(gasketAPI);
      expect(mockCreateTerminus).toHaveBeenCalledTimes(4);
      expect(mockCreateTerminus.mock.calls[0][0]).toEqual(aServer);
    });

    it('calls terminus with the options', async () => {
      await startServer(gasketAPI);
      const config = mockCreateTerminus.mock.calls[0][1];

      expect(config.signals).toContain('SIGTERM');
      expect(typeof config.logger).toBe('function');
      expect(typeof config.onSignal).toBe('function');
      expect(typeof config.onSendFailureDuringShutdown).toBe('function');
      expect(typeof config.beforeShutdown).toBe('function');
      expect(typeof config.onShutdown).toBe('function');

      expect(config.healthChecks['/healthcheck.html']).toBeTruthy();
      expect(config.healthChecks['/healthcheck']).toBeTruthy();
      expect(typeof config.healthChecks['/healthcheck']).toBe('function');
      expect(typeof config.healthChecks['/healthcheck.html']).toBe('function');
    });

    ['onSendFailureDuringShutdown', 'beforeShutdown', 'onSignal', 'onShutdown'].forEach((type) => {
      it(`calls the ${type} lifecycle`, async () => {
        await startServer(gasketAPI);
        const lifecycle = mockCreateTerminus.mock.calls[0][1][type];
        await lifecycle();

        expect(mockExec.mock.calls[mockExec.mock.calls.length - 1][0]).toEqual(type);
      });
    });

    it('calls the healthcheck lifecycle', async () => {
      await startServer(gasketAPI);
      const lifecycle = mockCreateTerminus.mock.calls[0][1].healthChecks['/healthcheck'];
      await lifecycle();

      expect(mockExec).toHaveBeenCalledWith('healthcheck', mockHealthCheckError);
    });

    it('calls the healthcheck lifecycle for healthcheck.html route', async () => {
      await startServer(gasketAPI);
      const lifecycle = mockCreateTerminus.mock.calls[0][1].healthChecks['/healthcheck.html'];
      await lifecycle();

      expect(mockExec).toHaveBeenCalledWith('healthcheck', mockHealthCheckError);
    });
  });
});
