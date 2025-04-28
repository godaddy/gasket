
class MockApp {
  constructor() {
    this.use = jest.fn();
    this.post = jest.fn();
    this.set = jest.fn();
  }
}

class MockBridgeApp {
  constructor() {
    this.use = jest.fn();
    this.post = jest.fn();
    this.set = jest.fn();
  }
}

const mockExpress = jest.fn().mockImplementation(() => {
  return new MockApp();
});
const mockExpressBridge = jest.fn().mockImplementation(() => {
  return new MockBridgeApp();
});
const cookieParserMiddleware = jest.fn();
const mockCookieParser = jest.fn().mockReturnValue(cookieParserMiddleware);
const compressionMiddleware = jest.fn();
const mockCompression = jest.fn().mockReturnValue(compressionMiddleware);

jest.mock('express', () => mockExpress);
jest.mock('http2-express', () => mockExpressBridge);
jest.mock('cookie-parser', () => mockCookieParser);
jest.mock('compression', () => mockCompression);

const {
  getAppInstance,
  testClearAppInstance
} = require('../lib/utils.js');

describe('getAppInstance', () => {
  let gasket;

  beforeEach(() => {
    gasket = {
      config: {}
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    expect(mockExpressBridge).toHaveBeenCalled();
    expect(result).toBeInstanceOf(MockBridgeApp);
  });

  it('attaches cookie parser middleware', function () {
    const mockApp = getAppInstance(gasket);
    expect(mockCookieParser).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalledWith(cookieParserMiddleware);
  });
});
