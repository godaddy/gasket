const errs = require('errs');
// const mockCreateServersModule = sinon.stub().yields(null, []);
const mockCreateServersModule = jest.fn(() => Promise.resolve());
const mockHealthCheckError = jest.fn();
const mockCreateTerminus = jest.fn();
const mockDebugStub = jest.fn();

jest.mock('create-servers', () => mockCreateServersModule);
jest.mock('diagnostics', () => mockDebugStub);
jest.mock('@godaddy/terminus', () => ({
  mockCreateTerminus,
  mockHealthCheckError
}));

const plugin = require('../lib');

describe('Plugin', () => {
  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'start',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });
});

describe('start hook', () => {
  let gasketAPI, handler;

  async function start() {
    return plugin.hooks.start(gasketAPI);
  }

  beforeEach(() => {
    gasketAPI = {
      execWaterfall: jest.fn(),
      // .mockImplementation((arg1, arg2) => Promise.resolve(arg2)),
      exec: jest.fn(),
      config: {},
      logger: {
        info: jest.fn(),
        error: jest.fn()
      }
    };
    handler = jest.fn(() => fn => fn());
    // mockCreateServersModule.mock(null, []);
    mockCreateServersModule.mockImplementation((() => Promise.resolve()));

    gasketAPI.exec.mockResolvedValue([handler]);
  });

  it('does not create an HTTP server if `http` is `null`', async () => {
    gasketAPI.config = {
      hostname: 'local.gasket.godaddy.com',
      http: null,
      https: { port: 3000 }
    };

    await start();
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

    await start();

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

    await start();

    const createServerOpts = mockCreateServersModule.mock.calls[mockCreateServersModule.mock.calls.length - 1][0];
    expect(createServerOpts).not.toHaveProperty('http');
    expect(createServerOpts).not.toHaveProperty('https');
    expect(createServerOpts).toHaveProperty('http2');
  });

  it('defaults HTTP server to port 80 if neither `http` or `https` or `http2`', async () => {
    gasketAPI.config = {};

    await start();

    const createServerOpts = mockCreateServersModule.mock.calls[mockCreateServersModule.mock.calls.length - 1][0];
    expect(createServerOpts).toHaveProperty('http', 80);
    expect(createServerOpts).not.toHaveProperty('https');
  });

  it('defaults HTTP server to port 8080 if env is local', async () => {
    gasketAPI.config = {
      env: 'local'
    };

    await start();

    const createServerOpts = mockCreateServersModule.mock.calls[mockCreateServersModule.mock.calls.length - 1][0];
    expect(createServerOpts).toHaveProperty('http', 8080);
    expect(createServerOpts).not.toHaveProperty('https');
  });

  it('does not defaults HTTP port if configured', async () => {
    gasketAPI.config = {
      env: 'local',
      http: 1234
    };

    await start();

    const createServerOpts = mockCreateServersModule.mock.calls[mockCreateServersModule.mock.calls.length - 1][0];
    expect(createServerOpts).toHaveProperty('http', 1234);
    expect(createServerOpts).not.toHaveProperty('https');
  });

  describe('success message', () => {
    beforeEach(() => {
      gasketAPI.execWaterfall.mockImplementation(() => Promise.resolve(gasketAPI.config));
    });

    // it.only('is output when the servers have been started', async () => {
    //   gasketAPI.config = {
    //     hostname: 'local.gasket.godaddy.com',
    //     http: 8080
    //   };

    //   await start();
    //   console.log(mockDebugStub.mock.calls)
    //   console.log(gasketAPI.execWaterfall.mock.calls)
    //   const logMessages = gasketAPI.logger.info.mock.calls.flat().map(([message]) => message);
    //   expect(logMessages[0]).toMatch(/http:\/\/local\.gasket\.godaddy\.com:8080\//);
    // });

    it('contains the configured hostname', async () => {
      gasketAPI.config = {
        hostname: 'myapp.godaddy.com',
        https: { port: 8443 }
      };

      await start();

      const logMessages = gasketAPI.logger.info.args.map(([message]) => message);
      expect(logMessages[0]).toMatch(/https:\/\/myapp\.godaddy\.com:8443\//);
    });

    it('contains the configured hostname for http2', async () => {
      gasketAPI.config = {
        hostname: 'myapp.godaddy.com',
        http2: { port: 8443 }
      };

      await start();

      const logMessages = gasketAPI.logger.info.args.map(([message]) => message);
      expect(logMessages[0]).toMatch(/https:\/\/myapp\.godaddy\.com:8443\//);
    });

    it('contains the configured port numbers', async () => {
      gasketAPI.config = {
        hostname: 'local.gasket.godaddy.com',
        https: { port: 3000 }
      };

      await start();

      const logMessages = gasketAPI.logger.info.args.map(([message]) => message);
      expect(logMessages[0]).toMatch(/https:\/\/local\.gasket\.godaddy\.com:3000\//);
    });

    it('uses config from createServers lifecycle', async () => {
      gasketAPI.config = {
        hostname: 'local.gasket.godaddy.com',
        http: 3000
      };

      gasketAPI.execWaterfall.mockImplementation(() => Promise.resolve({ hostname: 'bogus.com', http: 9000 }));

      await start();

      const logMessages = gasketAPI.logger.info.calls[0].map(([message]) => message);
      expect(logMessages[0]).toMatch(/http:\/\/bogus\.com:9000\//);
    });
  });

  it('rejects with an Error on failure', async () => {
    mockCreateServersModule.mockReturnValue(errs.create({ https: { message: 'HTTP server failed to start', code: 'something' } }));

    await start();

    const expected = 'failed to start the http/https servers';
    expect(gasketAPI.logger.error).toHaveBeenCalledWith(expected);
    expect(mockDebugStub.args[0][0].message).toEqual(expected);
    expect(mockDebugStub.args[0][1].https.message).toEqual('HTTP server failed to start');
  });

  it('rejects with an Error about ports on failure (with http)', async () => {
    mockCreateServersModule.mockReturnValue(errs.create({
      http: {
        code: 'EADDRINUSE'
      }
    }));

    await start();

    const expected = 'Port is already in use';
    expect(gasketAPI.logger.error).toHaveBeenCalledWith(expected);
    expect(mockDebugStub.args[0][0].message).toMatch(expected);
    expect(mockDebugStub.args[0][1].http.code).toEqual('EADDRINUSE');
  });

  it('rejects with an Error about ports on failure (with https)', async () => {
    mockCreateServersModule.mockReturnValue(errs.create({
      https: {
        code: 'EADDRINUSE'
      }
    }));

    await start();

    expect(mockDebugStub.args[0][0].message).toMatch('Port is already in use');
    expect(mockDebugStub.args[0][1].https.code).toEqual('EADDRINUSE');
  });

  it('rejects with an Error about ports on failure (with http2)', async () => {
    mockCreateServersModule.mockReturnValue(errs.create({
      http2: {
        code: 'EADDRINUSE'
      }
    }));

    await start();

    expect(mockDebugStub.args[0][0].message).toMatch('Port is already in use');
    expect(mockDebugStub.args[0][1].http2.code).toEqual('EADDRINUSE');
  });

  describe('terminus', function () {
    const aServer = {};
    const servers = { http: aServer };

    beforeEach(function () {
      mockCreateServersModule.mockReturnValue(null, servers);
    });

    it('passes each created server to terminus', async () => {
      await start();

      expect(mockCreateTerminus).toHaveBeenCalledTimes(1);
      expect(mockCreateTerminus.mock.calls[0][0]).toEqual(aServer);
    });

    it('supports multiple servers as object', async () => {
      mockCreateServersModule.mockReturnValue(null, { https: aServer, http: aServer });

      await start();
      expect(mockCreateTerminus).toHaveBeenCalledTimes(2);
      expect(mockCreateTerminus.mock.calls[0][0]).toEqual(aServer);
    });

    it('supports multiple servers under object properties', async () => {
      mockCreateServersModule.mockReturnValue(null, { https: [aServer, aServer], http: [aServer, aServer] });

      await start();
      expect(mockCreateTerminus).toHaveBeenCalledTimes(4);
      expect(mockCreateTerminus.mock.calls[0][0]).toEqual(aServer);
    });

    it('calls terminus with the options', async () => {
      await start();

      const config = mockCreateTerminus.mock.calls[0][1];

      expect(config.signals).toContain('SIGTERM');
      expect(typeof config.logger).toBe('function');
      expect(typeof config.onSignal).toBe('function');
      expect(typeof config.onSendFailureDuringShutdown).toBe('function');
      expect(typeof config.beforeShutdown).toBe('function');
      expect(typeof config.onShutdown).toBe('function');

      expect(config.healthChecks).has.toHaveProperty('/healthcheck');
      expect(typeof config.healthChecks['/healthcheck']).toBe('function');

      expect(config.healthChecks).has.toHaveProperty('/healthcheck.html');
      expect(typeof config.healthChecks['/healthcheck.html']).toBe('function');
    });

    ['onSendFailureDuringShutdown', 'beforeShutdown', 'onSignal', 'onShutdown'].forEach((type) => {
      it(`calls the ${type} lifecycle`, async () => {
        await start();
        const lifecycle = mockCreateTerminus.mock.calls[0][1][type];
        await lifecycle();

        expect(gasketAPI.exec.mock.calls[gasketAPI.exec.mock.calls.length - 1][0]).toEqual(type);
      });
    });

    it('calls the healthcheck lifecycle', async () => {
      await start();
      const lifecycle = mockCreateTerminus.args[0][1].healthChecks['/healthcheck'];
      await lifecycle();

      expect(gasketAPI.exec.mock.calls[gasketAPI.exec.mock.calls.length - 1][0]).toEqual('healthcheck');
      expect(gasketAPI.exec.mock.calls[gasketAPI.exec.mock.calls.length - 1][1]).toEqual(mockHealthCheckError);
    });

    it('calls the healthcheck lifecycle for healthcheck.html route', async () => {
      await start();
      console.log(mockCreateTerminus.mock.calls)
      const lifecycle = mockCreateTerminus.mock.calls[0][1].healthChecks['/healthcheck.html'];
      await lifecycle();

      expect(gasketAPI.exec.mock.calls[gasketAPI.exec.mock.calls.length - 1][0]).toEqual('healthcheck');
      expect(gasketAPI.exec.mock.calls[gasketAPI.exec.mock.calls.length - 1][1]).toEqual(mockHealthCheckError);
    });
  });
});
