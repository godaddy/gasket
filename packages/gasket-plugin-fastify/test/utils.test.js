import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

class MockApp {
  constructor() {
    this.ready = vi.fn();
    this.server = {
      emit: vi.fn()
    };
    this.register = vi.fn();
    this.use = vi.fn();
  }
}

const mockFastify = vi.fn().mockReturnValue(new MockApp());
const cookieParserMiddleware = vi.fn();
const compressionMiddleware = vi.fn();
const mockCookieParser = vi.fn().mockReturnValue(cookieParserMiddleware);
const mockCompression = vi.fn().mockReturnValue(compressionMiddleware);

vi.mock('fastify', () => ({ default: mockFastify }));
vi.mock('cookie-parser', () => ({ default: mockCookieParser }));
vi.mock('compression', () => ({ default: mockCompression }));

const {
  getAppInstance,
  testClearAppInstance
} = await import('../lib/utils.js');

describe('getAppInstance', () => {
  let gasket;

  beforeEach(() => {
    vi.clearAllMocks();
    gasket = {
      middleware: {},
      logger: {},
      config: {}
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
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
