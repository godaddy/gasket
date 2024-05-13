const nextHandler = {
  prepare: jest.fn().mockResolvedValue(),
  getRequestHandler: jest.fn().mockResolvedValue({})
};

const mockNext = jest.fn().mockReturnValue(nextHandler);

jest.mock('next', () => mockNext);

const getModule = () => require('../lib/setup-next-app');

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
  let gasket, setupNextHandling, serverApp, nextServer, mockNextHandler;
  let req, res, next;

  beforeEach(() => {
    gasket = mockGasketApi();
    setupNextHandling = getModule().setupNextHandling;
    serverApp = { all: jest.fn() };
    mockNextHandler = jest.fn();
    nextServer = {
      getRequestHandler: jest.fn().mockReturnValue(mockNextHandler)
    };
    req = {};
    res = { headersSent: false };
    next = jest.fn();
  });

  it('adds * route handler', function () {
    setupNextHandling(nextServer, serverApp, gasket);
    expect(serverApp.all).toHaveBeenCalledWith('*', expect.any(Function));
  });

  describe('route handler', () => {
    let routeHandler;
    beforeEach(() => {
      serverApp.all.mockImplementation((path, handler) => {
        routeHandler = handler;
      });

      setupNextHandling(nextServer, serverApp, gasket);
    });

    it('calls nextPreHandling lifecycle', async () => {
      await routeHandler(req, res, next);
      expect(gasket.exec).toHaveBeenCalledWith('nextPreHandling', { req, res, nextServer });
    });

    it('calls nextHandler', async () => {
      await routeHandler(req, res, next);
      expect(mockNextHandler).toHaveBeenCalledWith(req, res);
    });

    it('does not call nextHandler if headers sent in lifecycle', async () => {
      res.headersSent = true;
      await routeHandler(req, res, next);
      expect(mockNextHandler).not.toHaveBeenCalled();
    });

    it('catches errors', async () => {
      const testError = new Error('Test error');
      mockNextHandler.mockImplementation(() => {
        throw testError;
      });
      await routeHandler(req, res, next);
      expect(next).toHaveBeenCalledWith(testError);
    });
  });
});

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
    }
  };
}
