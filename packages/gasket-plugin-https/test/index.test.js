const errs = require('errs');
const mockCreateServersModule = jest.fn().mockImplementation((server, fn) => fn(null, server));
const mockHealthCheckError = jest.fn();
const mockCreateTerminus = jest.fn();
const mockDebugStub = jest.fn();
const mockProxyCreateServer = jest.fn().mockReturnValue({
  on: jest.fn().mockReturnValue({
    listen: jest.fn()
  })
});

const mockExec = jest.fn();

jest.mock('create-servers', () => mockCreateServersModule);
jest.mock('diagnostics', () => () => mockDebugStub);
jest.mock('@godaddy/terminus', () => ({
  createTerminus: mockCreateTerminus,
  HealthCheckError: mockHealthCheckError
}));
jest.mock('http-proxy', () => ({
  createServer: mockProxyCreateServer
}));

const plugin = require('../lib');
const { name, version, description } = require('../package');

describe('Plugin', () => {
  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
    expect(plugin).toHaveProperty('actions');
    expect(plugin).toHaveProperty('hooks');
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });
});

describe('startServer action', () => {
  let gasketAPI, handler;

  beforeEach(() => {
    jest.clearAllMocks();
    gasketAPI = {
      execWaterfall: jest.fn().mockImplementation((arg1, arg2) => Promise.resolve(arg2)),
      exec: mockExec,
      root: () => ({
        exec: mockExec
      }),
      config: {},
      logger: {
        info: jest.fn(),
        error: jest.fn()
      }
    };
    handler = jest.fn().mockImplementation(fn => fn());
    gasketAPI.exec.mockResolvedValue([handler]);
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
      await plugin.actions.startServer(gasketAPI);
      expect(gasketAPI.execWaterfall).toHaveBeenCalledWith('devProxy', gasketAPI.config.devProxy);
    });

    it('creates proxy server when configured', async () => {
      await plugin.actions.startServer(gasketAPI);
      expect(mockProxyCreateServer).toHaveBeenCalledWith(gasketAPI.config.devProxy);
    });

    it('sets default values for proxy server', async () => {
      await plugin.actions.startServer(gasketAPI);
      expect(mockProxyCreateServer).toHaveBeenCalledWith({
        target: {
          host: 'localhost',
          port: 5000
        }
      });
    });

    it('does not create proxy server when not configured', async () => {
      gasketAPI.config = {};
      await plugin.actions.startServer(gasketAPI);
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

    await plugin.actions.startServer(gasketAPI);
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

    await plugin.actions.startServer(gasketAPI);

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

    await plugin.actions.startServer(gasketAPI);

    const createServerOpts = mockCreateServersModule.mock.calls[mockCreateServersModule.mock.calls.length - 1][0];
    expect(createServerOpts).not.toHaveProperty('http');
    expect(createServerOpts).not.toHaveProperty('https');
    expect(createServerOpts).toHaveProperty('http2');
  });

  it('defaults HTTP server to port 80 if neither `http` or `https` or `http2`', async () => {
    gasketAPI.config = {};

    await plugin.actions.startServer(gasketAPI);

    const createServerOpts = mockCreateServersModule.mock.calls[mockCreateServersModule.mock.calls.length - 1][0];
    expect(createServerOpts).toHaveProperty('http', 80);
    expect(createServerOpts).not.toHaveProperty('https');
  });

  it('defaults HTTP server to port 8080 if env is local', async () => {
    gasketAPI.config = {
      env: 'local'
    };

    await plugin.actions.startServer(gasketAPI);

    const createServerOpts = mockCreateServersModule.mock.calls[mockCreateServersModule.mock.calls.length - 1][0];
    expect(createServerOpts).toHaveProperty('http', 8080);
    expect(createServerOpts).not.toHaveProperty('https');
  });

  it('does not defaults HTTP port if configured', async () => {
    gasketAPI.config = {
      env: 'local',
      http: 1234
    };

    await plugin.actions.startServer(gasketAPI);

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

      await plugin.actions.startServer(gasketAPI);
      const logMessages = gasketAPI.logger.info.mock.calls.flat().map(message => message);

      expect(logMessages[0]).toMatch(/http:\/\/local\.gasket\.godaddy\.com:8080\//);
    });

    it('contains the configured hostname', async () => {
      gasketAPI.config = {
        hostname: 'myapp.godaddy.com',
        https: { port: 8443 }
      };

      await plugin.actions.startServer(gasketAPI);

      const logMessages = gasketAPI.logger.info.mock.calls.flat().map(message => message);
      expect(logMessages[0]).toMatch(/https:\/\/myapp\.godaddy\.com:8443\//);
    });

    it('contains the configured hostname for http2', async () => {
      gasketAPI.config = {
        hostname: 'myapp.godaddy.com',
        http2: { port: 8443 }
      };

      await plugin.actions.startServer(gasketAPI);

      const logMessages = gasketAPI.logger.info.mock.calls.flat().map(message => message);
      expect(logMessages[0]).toMatch(/https:\/\/myapp\.godaddy\.com:8443\//);
    });

    it('contains the configured port numbers', async () => {
      gasketAPI.config = {
        hostname: 'local.gasket.godaddy.com',
        https: { port: 3000 }
      };

      await plugin.actions.startServer(gasketAPI);

      const logMessages = gasketAPI.logger.info.mock.calls.flat().map(message => message);
      expect(logMessages[0]).toMatch(/https:\/\/local\.gasket\.godaddy\.com:3000\//);
    });

    it('uses config from createServers lifecycle', async () => {
      gasketAPI.config = {
        hostname: 'local.gasket.godaddy.com',
        http: 3000
      };

      gasketAPI.execWaterfall.mockImplementation(() => Promise.resolve({ hostname: 'bogus.com', http: 9000 }));

      await plugin.actions.startServer(gasketAPI);

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

    await plugin.actions.startServer(gasketAPI);

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


    await plugin.actions.startServer(gasketAPI);

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

    await plugin.actions.startServer(gasketAPI);

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

    await plugin.actions.startServer(gasketAPI);

    expect(mockDebugStub.mock.calls[0][0].message).toMatch('Port is already in use');
    expect(mockDebugStub.mock.calls[0][1].http2.code).toEqual('EADDRINUSE');
  });

  describe('terminus', function () {
    const aServer = {};
    const servers = { http: aServer };

    beforeEach(function () {
      mockCreateServersModule.mockImplementation((_, fn) => fn(null, servers));
    });

    it('passes each created server to terminus', async () => {
      await plugin.actions.startServer(gasketAPI);

      expect(mockCreateTerminus).toHaveBeenCalledTimes(1);
      expect(mockCreateTerminus.mock.calls[0][0]).toEqual(aServer);
    });

    it('supports multiple servers as object', async () => {
      mockCreateServersModule.mockImplementation((_, fn) => fn(null, { https: aServer, http: aServer }));

      await plugin.actions.startServer(gasketAPI);
      expect(mockCreateTerminus).toHaveBeenCalledTimes(2);
      expect(mockCreateTerminus.mock.calls[0][0]).toEqual(aServer);
    });

    it('supports multiple servers under object properties', async () => {
      mockCreateServersModule.mockImplementation((_, fn) => fn(null, { https: [aServer, aServer], http: [aServer, aServer] }));

      await plugin.actions.startServer(gasketAPI);
      expect(mockCreateTerminus).toHaveBeenCalledTimes(4);
      expect(mockCreateTerminus.mock.calls[0][0]).toEqual(aServer);
    });

    it('calls terminus with the options', async () => {
      await plugin.actions.startServer(gasketAPI);
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
        await plugin.actions.startServer(gasketAPI);
        const lifecycle = mockCreateTerminus.mock.calls[0][1][type];
        await lifecycle();

        expect(mockExec.mock.calls[mockExec.mock.calls.length - 1][0]).toEqual(type);
      });
    });

    it('calls the healthcheck lifecycle', async () => {
      await plugin.actions.startServer(gasketAPI);
      const lifecycle = mockCreateTerminus.mock.calls[0][1].healthChecks['/healthcheck'];
      await lifecycle();

      expect(mockExec).toHaveBeenCalledWith('healthcheck', mockHealthCheckError);
    });

    it('calls the healthcheck lifecycle for healthcheck.html route', async () => {
      await plugin.actions.startServer(gasketAPI);
      const lifecycle = mockCreateTerminus.mock.calls[0][1].healthChecks['/healthcheck.html'];
      await lifecycle();

      expect(mockExec).toHaveBeenCalledWith('healthcheck', mockHealthCheckError);
    });
  });
});
