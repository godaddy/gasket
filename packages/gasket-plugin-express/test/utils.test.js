import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

class MockApp {
  constructor() {
    this.use = vi.fn();
    this.post = vi.fn();
    this.set = vi.fn();
  }
}

class MockBridgeApp {
  constructor() {
    this.use = vi.fn();
    this.post = vi.fn();
    this.set = vi.fn();
  }
}

vi.mock('express', () => ({
  default: vi.fn().mockImplementation(() => new MockApp())
}));

vi.mock('http2-express', () => ({
  default: vi.fn().mockImplementation(() => new MockBridgeApp())
}));

vi.mock('cookie-parser', () => ({
  default: vi.fn().mockReturnValue(vi.fn())
}));

const { getAppInstance, testClearAppInstance } = await import('../lib/utils.js');

describe('getAppInstance', () => {
  let gasket;

  beforeEach(() => {
    gasket = {
      config: {}
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    testClearAppInstance();
  });

  it('returns the express instance', function () {
    const result = getAppInstance(gasket);
    expect(result).toBeInstanceOf(MockApp);
  });

  it('returns same instance for repeated calls', function () {
    const result = getAppInstance(gasket);
    expect(result).toBeInstanceOf(MockApp);

    const result2 = getAppInstance(gasket);
    expect(result2).toBeInstanceOf(MockApp);
    expect(result2).toBe(result);
  });

  it('returns a bridge instance when http2 is enabled', function () {
    gasket.config.http2 = true;
    const result = getAppInstance(gasket);
    expect(result).toBeInstanceOf(MockBridgeApp);
  });

  it('attaches cookie parser middleware', function () {
    const mockApp = getAppInstance(gasket);
    expect(mockApp.use).toHaveBeenCalled();
  });
});
