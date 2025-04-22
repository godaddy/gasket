/* eslint-disable jsdoc/require-jsdoc */

class MockApp {
  constructor() {
    this.ready = jest.fn();
    this.server = {
      emit: jest.fn()
    };
    this.register = jest.fn();
    this.use = jest.fn();
  }
}

const mockFastify = jest.fn().mockReturnValue(new MockApp());
const cookieParserMiddleware = jest.fn();
const compressionMiddleware = jest.fn();
const mockCookieParser = jest.fn().mockReturnValue(cookieParserMiddleware);
const mockCompression = jest.fn().mockReturnValue(compressionMiddleware);


jest.mock('fastify', () => mockFastify);
jest.mock('cookie-parser', () => mockCookieParser);
jest.mock('compression', () => mockCompression);


const {
  getAppInstance,
  testClearAppInstance
} = require('../lib/utils');

describe('getAppInstance', () => {
  let gasket;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    gasket = {
      middleware: {},
      logger: {},
      config: {}
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    testClearAppInstance();
  });

  it('should return app from getFastifyApp action', () => {
    expect(getAppInstance(gasket)).toBeInstanceOf(MockApp);
  });

  it('does not enable trust proxy by default', async () => {
    getAppInstance(gasket);
    expect(mockFastify).toHaveBeenCalledWith({
      logger: gasket.logger,
      trustProxy: false,
      disableRequestLogging: true
    });
  });

  it('does enable trust proxy by if set to true', async () => {
    gasket.config.fastify = { trustProxy: true };
    getAppInstance(gasket);

    expect(mockFastify).toHaveBeenCalledWith({
      logger: gasket.logger,
      trustProxy: true,
      disableRequestLogging: true
    });
  });

  it('does enable trust proxy by if set to string', async () => {
    gasket.config.fastify = { trustProxy: '127.0.0.1' };
    getAppInstance(gasket);

    expect(mockFastify).toHaveBeenCalledWith({
      logger: gasket.logger,
      trustProxy: '127.0.0.1',
      disableRequestLogging: true
    });
  });

  it('defaults to true for disableRequestLogging', async () => {
    getAppInstance(gasket);

    expect(mockFastify).toHaveBeenCalledWith({
      logger: gasket.logger,
      trustProxy: false,
      disableRequestLogging: true
    });
  });

  it('allows request logging if disableRequestLogging is set to false', async () => {
    gasket.config.fastify = { disableRequestLogging: false };
    getAppInstance(gasket);

    expect(mockFastify).toHaveBeenCalledWith({
      logger: gasket.logger,
      trustProxy: false,
      disableRequestLogging: false
    });
  });

  it('adds log plugin as logger to fastify', async function () {
    getAppInstance(gasket);

    expect(mockFastify).toHaveBeenCalledWith({
      logger: gasket.logger,
      trustProxy: false,
      disableRequestLogging: true
    });
  });
});
