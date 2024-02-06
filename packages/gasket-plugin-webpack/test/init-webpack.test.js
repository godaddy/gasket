/* eslint-disable no-sync */
const initWebpack = require('../lib/init-webpack');

describe('init webpack', function () {
  let mockGasket, mockContext, mockConfig;

  beforeEach(function () {
    mockGasket = {
      execWaterfallSync: jest.fn((_, config) => config),
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
    expect(mockGasket.execWaterfallSync).toHaveBeenCalledWith(
      'webpackConfig', expect.any(Object), { webpack: expect.any(Function) }
    );
  });

  describe('webpackConfig lifecycle callback', function () {
    let baseConfig, setupContextStub;

    beforeEach(function () {
      baseConfig = initWebpack(mockGasket, {}, mockContext);
      setupContextStub = mockGasket.execWaterfallSync.mock.calls[0][2];
    });

    it('called with baseConfig', function () {
      const baseConfigStub = mockGasket.execWaterfallSync.mock.calls[0][1];
      expect(typeof baseConfigStub).toBe('object');
      expect(baseConfigStub).toEqual(baseConfig);
    });

    it('context.webpack returns webpack', function () {
      expect(setupContextStub.webpack).toEqual(require('webpack'));
    });

  });
});
