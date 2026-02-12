// Mock Next.js FIRST before any other imports
const nextHandler = {
  prepare: vi.fn().mockResolvedValue(),
  getRequestHandler: vi.fn().mockResolvedValue({}),
  buildId: '1234',
  name: 'testapp'
};

const mockNext = vi.fn().mockReturnValue(nextHandler);

// Mock 'next' module - must be at the very top before any imports
vi.mock('next', () => ({
  default: mockNext
}));

const { setupNextHandling } = await import('../lib/utils/setup-next-app.js');
let setupNextApp;

describe('setupNextApp', () => {
  let gasket;

  beforeEach(async () => {
    vi.clearAllMocks();
    // eslint-disable-next-line no-process-env
    delete process.env.GASKET_DEV;

    // Re-import the module to get fresh mocks
    vi.resetModules();
    const module = await import('../lib/utils/setup-next-app.js');
    setupNextApp = module.setupNextApp;
  });

  it('exports setupNextApp instance', function () {
    expect(setupNextApp).toBeDefined();
    expect(typeof setupNextApp).toBe('function');
  });

  it('executes the `next` lifecycle', async function () {
    gasket = mockGasketApi();
    await setupNextApp(gasket);
    expect(gasket.exec).toHaveBeenCalledWith('next', nextHandler);
  });

  describe('devServer mode', () => {

    it('creates devServer when GASKET_DEV is set', async function () {
      gasket = mockGasketApi();
      // eslint-disable-next-line no-process-env
      process.env.GASKET_DEV = '1';
      await setupNextApp(gasket);
      expect(mockNext).toHaveBeenCalledWith({
        dev: true,
        hostname: 'localhost',
        port: 3000,
        webpack: true
      });
    });

    it('creates default mode nextjs app when gasket command is not local', async function () {
      gasket = mockGasketApi();
      await setupNextApp(gasket);
      expect(mockNext).toHaveBeenCalledWith({
        dev: false,
        hostname: 'localhost',
        port: 3000,
        webpack: true
      });
    });

    it('uses port 80 as a fallback when the http property is undefined on the Gasket config and not local', async function () {
      gasket = mockGasketApi();
      // eslint-disable-next-line no-undefined
      gasket.config.http = undefined;
      await setupNextApp(gasket);
      expect(mockNext).toHaveBeenCalledWith({
        dev: false,
        hostname: 'localhost',
        port: 80,
        webpack: true
      });
    });

    it('uses port 8080 as a fallback when the http property is undefined on the Gasket config and local', async function () {
      gasket = mockGasketApi();
      // eslint-disable-next-line no-undefined
      gasket.config.http = undefined;
      gasket.config.env = 'local';
      await setupNextApp(gasket);
      expect(mockNext).toHaveBeenCalledWith({
        dev: false,
        hostname: 'localhost',
        port: 8080,
        webpack: true
      });
    });
  });
});

describe('setupNextHandling', () => {
  const mockNextHandler = vi.fn();
  const nextServer = {
    getRequestHandler: () => mockNextHandler
  };

  const gasket = {
    traceRoot: () => ({
      exec: vi.fn()
    })
  };

  it('route handler calls nextHandler for Fastify', async () => {
    const fastifyApp = {
      route: vi.fn(),
      inject: vi.fn()
    };

    setupNextHandling(nextServer, fastifyApp, gasket);

    // simulate captured route handler
    const handler = fastifyApp.route.mock.calls[0][0].handler;

    const req = { raw: {} };
    const res = { raw: { headersSent: false } };
    await handler(req, res);

    expect(mockNextHandler).toHaveBeenCalledWith(req.raw, res.raw);
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
    execWaterfall: vi.fn((_, arg) => arg),
    exec: vi.fn().mockResolvedValue({}),
    execSync: vi.fn().mockReturnValue([]),
    logger: {
      warn: vi.fn()
    },
    config: {
      webpack: {}, // user specified webpack config
      nextConfig: {}, // user specified next.js config
      root: '/app/path',
      http: 3000,
      hostname: 'localhost'
    },
    traceRoot: vi.fn().mockReturnThis()
  };
}
