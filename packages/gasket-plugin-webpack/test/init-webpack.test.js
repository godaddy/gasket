/* eslint-disable no-sync */
const initWebpack = require('../lib/init-webpack');

describe('init webpack', function () {
  let mockGasket, mockContext, mockConfig;

  beforeEach(function () {
    mockGasket = {
      execApplySync: jest.fn(),
      logger: {
        warning: jest.fn()
      },
      config: {}
    };
    mockContext = {};
    mockConfig = {};
  });

  afterEach(function () {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('returns webpack config object', function () {
    const results = initWebpack(mockGasket, mockConfig, mockContext);
    expect(typeof results).toBe('object');
  });

  it('configures webpack metrics plugin', function () {
    const results = initWebpack(mockGasket, mockConfig, mockContext);
    expect(results).toHaveProperty('plugins');
    expect(results.plugins[0].constructor.name).toBe('WebpackMetricsPlugin');
  });

  it('executes webpackConfig lifecycle', function () {
    initWebpack(mockGasket, mockConfig, mockContext);
    expect(mockGasket.execApplySync).toHaveBeenCalledWith('webpackConfig', expect.any(Function));
  });

  describe('webpackConfig lifecycle callback', function () {
    let applyFn, mockPlugin, handlerStub, baseConfig;

    beforeEach(function () {
      mockPlugin = { name: 'mock-plugin' };
      handlerStub = jest.fn();

      baseConfig = initWebpack(mockGasket, {}, mockContext);
      applyFn = mockGasket.execApplySync.mock.calls[0][1];
    });

    it('called with baseConfig', function () {
      applyFn(mockPlugin, handlerStub);
      expect(handlerStub).toHaveBeenCalledWith(baseConfig, expect.any(Object));
    });

    it('called with context', function () {
      applyFn(mockPlugin, handlerStub);
      const context = handlerStub.mock.calls[0][1];
      expect(typeof context).toBe('object');
    });

    it('context.webpack returns webpack', function () {
      applyFn(mockPlugin, handlerStub);
      const context = handlerStub.mock.calls[0][1];
      expect(context.webpack).toEqual(require('webpack'));
    });

  });
});
