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

const mockApp = new MockApp();
const mockAdapter = {
  createInstance: vi.fn().mockReturnValue(mockApp)
};

const mockCreateFastifyAdapter = vi.fn().mockReturnValue(mockAdapter);

vi.mock('../lib/adapters/index.js', () => ({
  createFastifyAdapter: mockCreateFastifyAdapter
}));

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
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn()
      },
      config: {}
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    testClearAppInstance();
  });

  it('should return app from getAppInstance', () => {
    const app = getAppInstance(gasket);
    expect(app).toBe(mockApp);
  });

  it('creates adapter when first called', () => {
    getAppInstance(gasket);
    expect(mockCreateFastifyAdapter).toHaveBeenCalledTimes(1);
  });

  it('passes config to adapter createInstance', () => {
    gasket.config.fastify = { trustProxy: true, disableRequestLogging: false };
    gasket.config.https = { key: 'test', cert: 'test' };
    gasket.config.http2 = true;

    getAppInstance(gasket);

    expect(mockAdapter.createInstance).toHaveBeenCalledWith(
      {
        trustProxy: true,
        disableRequestLogging: false,
        https: { key: 'test', cert: 'test' },
        http2: true
      },
      gasket.logger
    );
  });

  it('caches instance on subsequent calls', () => {
    const app1 = getAppInstance(gasket);
    const app2 = getAppInstance(gasket);

    expect(app1).toBe(app2);
    expect(mockCreateFastifyAdapter).toHaveBeenCalledTimes(1);
  });

  it('clears cache with testClearAppInstance', () => {
    getAppInstance(gasket);
    testClearAppInstance();
    getAppInstance(gasket);

    expect(mockCreateFastifyAdapter).toHaveBeenCalledTimes(2);
  });
});
