import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockCookieMiddleware = vi.fn();

class MockApp {
  constructor() {
    this.use = vi.fn();
  }
}

class MockBridgeApp {
  constructor() {
    this.use = vi.fn();
  }
}

vi.mock('express', () => ({
  default: vi.fn().mockImplementation(() => new MockApp())
}));

vi.mock('http2-express', () => ({
  default: vi.fn().mockImplementation(() => new MockBridgeApp())
}));

vi.mock('cookie-parser', () => ({
  default: vi.fn().mockImplementation(() => mockCookieMiddleware)
}));

const { default: express } = await import('express');
const { default: http2Express } = await import('http2-express');
const { ExpressAdapter } = await import('../lib/adapters/base-adapter.js');
const { ExpressV4Adapter } = await import('../lib/adapters/express-v4-adapter.js');
const { ExpressV5Adapter } = await import('../lib/adapters/express-v5-adapter.js');
const { createExpressAdapter, detectExpressVersion } = await import('../lib/adapters/adapter-factory.js');

describe('ExpressAdapter', () => {
  it('cannot be instantiated directly', () => {
    expect(() => new ExpressAdapter()).toThrow('ExpressAdapter is an abstract class');
  });

  it('subclasses must implement createInstance', () => {
    class Incomplete extends ExpressAdapter {}
    expect(() => new Incomplete().createInstance({})).toThrow('createInstance() must be implemented by subclass');
  });
});

describe.each([
  ['ExpressV4Adapter', ExpressV4Adapter],
  ['ExpressV5Adapter', ExpressV5Adapter]
])('%s', (name, Adapter) => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an app with cookie-parser', () => {
    const app = new Adapter().createInstance({});
    expect(app).toBeInstanceOf(MockApp);
    expect(express).toHaveBeenCalled();
    expect(http2Express).not.toHaveBeenCalled();
    expect(app.use).toHaveBeenCalledWith(mockCookieMiddleware);
  });

  it('uses http2-express when http2 is set', () => {
    const app = new Adapter().createInstance({ http2: true });
    expect(app).toBeInstanceOf(MockBridgeApp);
    expect(http2Express).toHaveBeenCalledWith(express);
    expect(app.use).toHaveBeenCalledWith(mockCookieMiddleware);
  });
});

describe('detectExpressVersion', () => {
  it('returns the installed express version', () => {
    expect(detectExpressVersion()).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe('createExpressAdapter', () => {
  it('picks the adapter for the installed major', () => {
    expect(createExpressAdapter('5.3.0')).toBeInstanceOf(ExpressV5Adapter);
    expect(createExpressAdapter('4.22.3')).toBeInstanceOf(ExpressV4Adapter);
  });

  it('detects the version when none is given', () => {
    const major = parseInt(detectExpressVersion().split('.')[0], 10);
    const Expected = major === 5 ? ExpressV5Adapter : ExpressV4Adapter;
    expect(createExpressAdapter()).toBeInstanceOf(Expected);
  });

  it('throws on an unsupported major', () => {
    expect(() => createExpressAdapter('6.0.0')).toThrow(/Unsupported Express version: 6\.0\.0/);
  });
});
