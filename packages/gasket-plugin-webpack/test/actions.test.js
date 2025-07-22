const actions = require('../lib/actions');

describe('init webpack', function () {
  let mockGasket, mockContext, mockConfig;

  beforeEach(function () {
    mockGasket = {
      execWaterfallSync: jest.fn((_, config) => config),
      logger: {
        warn: jest.fn()
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

  it('has expected actions', () => {
    const expected = [
      'getWebpackConfig'
    ];

    expect(Object.keys(actions)).toEqual(expected);
  });

  describe('getWebpackConfig', () => {
    const { getWebpackConfig } = actions;

    it('returns webpack config object', function () {
      const results = getWebpackConfig(mockGasket, mockConfig, mockContext);
      expect(typeof results).toBe('object');
    });

    it('configures webpack metrics plugin', function () {
      const results = getWebpackConfig(mockGasket, mockConfig, mockContext);
      expect(results).toHaveProperty('plugins');
      expect(results.plugins[0].constructor.name).toBe('WebpackMetricsPlugin');
    });

    it('configures gasket env guard plugin', function () {
      const results = getWebpackConfig(mockGasket, mockConfig, mockContext);
      expect(results).toHaveProperty('plugins');
      expect(results.plugins[1].constructor.name).toBe('GasketEnvGuardPlugin');
    });

    it('aliases out webpack', function () {
      const results = getWebpackConfig(mockGasket, mockConfig, mockContext);
      expect(results).toHaveProperty('resolve.alias');
      expect(results.resolve.alias).toEqual({
        webpack: false
      });
    });

    it('executes webpackConfig lifecycle', function () {
      getWebpackConfig(mockGasket, mockConfig, mockContext);
      expect(mockGasket.execWaterfallSync).toHaveBeenCalledWith(
        'webpackConfig',
        expect.any(Object),
        { webpack: expect.any(Function) }
      );
    });

    describe('webpackConfig lifecycle callback', function () {
      let baseConfig, setupContextStub;

      beforeEach(function () {
        baseConfig = getWebpackConfig(mockGasket, {}, mockContext);
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
});
