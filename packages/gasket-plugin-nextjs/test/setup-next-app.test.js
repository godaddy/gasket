const { setupNextHandling } = require('../lib/utils/setup-next-app');

const nextHandler = {
  prepare: jest.fn().mockResolvedValue(),
  getRequestHandler: jest.fn().mockResolvedValue({})
};

const mockNext = jest.fn().mockReturnValue(nextHandler);

jest.mock('next', () => mockNext);

const getModule = () => require('../lib/utils/setup-next-app');

describe('setupNextApp', () => {
  let gasket, module;

  beforeEach(() => {
    module = getModule();
    jest.clearAllMocks();
    delete process.env.GASKET_DEV;
  });

  it('exports setupNextApp instance', function () {
    expect(module).toHaveProperty('setupNextApp');
    expect(typeof module.setupNextApp).toBe('function');
  });

  it('executes the `next` lifecycle', async function () {
    gasket = mockGasketApi();
    await module.setupNextApp(gasket);
    expect(gasket.exec).toHaveBeenCalledWith('next', nextHandler);
  });

  describe('devServer mode', () => {

    it('creates devServer when GASKET_DEV is set', async function () {
      gasket = mockGasketApi();
      process.env.GASKET_DEV = '1';
      await module.setupNextApp(gasket);
      expect(mockNext).toHaveBeenCalledWith({
        dev: true,
        hostname: 'localhost',
        port: 3000
      });
    });

    it('creates default mode nextjs app when gasket command is not local', async function () {
      gasket = mockGasketApi();
      await module.setupNextApp(gasket);
      expect(mockNext).toHaveBeenCalledWith({
        dev: false,
        hostname: 'localhost',
        port: 3000
      });
    });

    it('uses port 80 as a fallback when the http property is undefined on the Gasket config and not local', async function () {
      gasket = mockGasketApi();
      // eslint-disable-next-line no-undefined
      gasket.config.http = undefined;
      await module.setupNextApp(gasket);
      expect(mockNext).toHaveBeenCalledWith({
        dev: false,
        hostname: 'localhost',
        port: 80
      });
    });

    it('uses port 8080 as a fallback when the http property is undefined on the Gasket config and local', async function () {
      gasket = mockGasketApi();
      // eslint-disable-next-line no-undefined
      gasket.config.http = undefined;
      gasket.config.env = 'local';
      await module.setupNextApp(gasket);
      expect(mockNext).toHaveBeenCalledWith({
        dev: false,
        hostname: 'localhost',
        port: 8080
      });
    });
  });
});

describe('setupNextHandling', () => {
  const nextHandler = jest.fn();
  const nextServer = {
    getRequestHandler: () => nextHandler
  };

  const gasket = {
    traceRoot: () => ({
      exec: jest.fn()
    })
  };

  it('route handler calls nextHandler for Fastify', async () => {
    const fastifyApp = {
      route: jest.fn(),
      inject: jest.fn()
    };

    setupNextHandling(nextServer, fastifyApp, gasket);

    // simulate captured route handler
    const handler = fastifyApp.route.mock.calls[0][0].handler;

    const req = { raw: {} };
    const res = { raw: { headersSent: false } };
    await handler(req, res);

    expect(nextHandler).toHaveBeenCalledWith(req.raw, res.raw);
  });
});

/**
 * Mock gasket API
 * @returns {object} gasket API
 */
function mockGasketApi() {
  return {
    command: {
      id: 'fake'
    },
    execWaterfall: jest.fn((_, arg) => arg),
    exec: jest.fn().mockResolvedValue({}),
    execSync: jest.fn().mockReturnValue([]),
    logger: {
      warn: jest.fn()
    },
    config: {
      webpack: {}, // user specified webpack config
      nextConfig: {}, // user specified next.js config
      root: '/app/path',
      http: 3000,
      hostname: 'localhost'
    },
    traceRoot: jest.fn().mockReturnThis()
  };
}
