const mockSmartStub = jest.fn();

jest.mock('webpack-merge', () => ({
  smart: mockSmartStub
}));

const deprecatedMerges = require('../lib/deprecated-merges');

describe('deprecatedMerges', function () {
  let mockGasket, mockContext, mockConfig;
  let mockChain, webpackChainCb, webpackCb;

  beforeEach(function () {
    mockChain = {
      toConfig: jest.fn().mockReturnValue({})
    };
    mockGasket = {
      execApplySync: jest.fn().mockImplementation((name, callback) => {
        if (name === 'webpackChain') {
          webpackChainCb = callback;
          return mockChain;
        } else if (name === 'webpack') {
          webpackCb = callback;
          return [{}];
        }
      }),
      logger: {
        warning: jest.fn()
      },
      config: {}
    };
    mockContext = {};
    mockConfig = {};
    mockSmartStub.mockReturnValue({});
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('returns webpack config object', function () {
    const results = deprecatedMerges(mockGasket, mockConfig, mockContext);
    expect(typeof results).toBe('object');
  });

  it('smart merges', function () {
    deprecatedMerges(mockGasket, mockConfig, mockContext);
    expect(mockSmartStub).toHaveBeenCalled();
  });

  describe('gasket.config.webpack', function () {

    it('logs deprecated warning if set', function () {
      mockGasket.config.webpack = {};
      deprecatedMerges(mockGasket, mockConfig, mockContext);
      expect(mockGasket.logger.warning).toHaveBeenCalledWith(expect.stringMatching(/DEPRECATED `webpack` in Gasket config/));
    });

    it('does not log warning if not set', function () {
      deprecatedMerges(mockGasket, mockConfig, mockContext);
      expect(mockGasket.logger.warning).not.toHaveBeenCalled();
    });
  });

  describe('webpackChain', function () {

    beforeEach(function () {
      deprecatedMerges(mockGasket, mockConfig, mockContext);
    });

    it('logs deprecated warning', function () {
      webpackChainCb({ name: 'mock-plugin' }, jest.fn());
      expect(mockGasket.logger.warning).toHaveBeenCalledWith(expect.stringMatching(/DEPRECATED `webpackChain` lifecycle/));
    });

    it('logs plugin name', function () {
      webpackChainCb({ name: 'mock-plugin' }, jest.fn());
      expect(mockGasket.logger.warning).toHaveBeenCalledWith(expect.stringMatching(/mock-plugin/));
    });

    it('logs unnamed plugin', function () {
      webpackChainCb({}, jest.fn());
      expect(mockGasket.logger.warning).toHaveBeenCalledWith(expect.stringMatching(/unnamed plugin/));
    });

    it('logs app lifecycle', function () {
      // eslint-disable-next-line no-undefined
      webpackChainCb(undefined, jest.fn());
      expect(mockGasket.logger.warning).toHaveBeenCalledWith(expect.stringMatching(/app lifecycle/));
    });
  });

  describe('webpack', function () {

    beforeEach(function () {
      deprecatedMerges(mockGasket, mockConfig, mockContext);
    });

    it('logs deprecated warning', function () {
      webpackCb({ name: 'mock-plugin' }, jest.fn());
      expect(mockGasket.logger.warning).toHaveBeenCalledWith(expect.stringMatching(/DEPRECATED `webpack` lifecycle/));
    });

    it('logs plugin name', function () {
      webpackCb({ name: 'mock-plugin' }, jest.fn());
      expect(mockGasket.logger.warning).toHaveBeenCalledWith(expect.stringMatching(/mock-plugin/));
    });

    it('logs unnamed plugin', function () {
      webpackCb({}, jest.fn());
      expect(mockGasket.logger.warning).toHaveBeenCalledWith(expect.stringMatching(/unnamed plugin/));
    });

    it('logs app lifecycle', function () {
      // eslint-disable-next-line no-undefined
      webpackCb(undefined, jest.fn());
      expect(mockGasket.logger.warning).toHaveBeenCalledWith(expect.stringMatching(/app lifecycle/));
    });
  });
});
