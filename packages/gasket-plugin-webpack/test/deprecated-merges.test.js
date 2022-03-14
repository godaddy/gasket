const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const deprecatedSmartMerge = require('webpack-merge').smart;

describe('deprecatedMerges', function () {
  let deprecatedMerges, smartStub, mockGasket, mockContext, mockConfig;
  let mockChain, webpackChainCb, webpackCb;

  beforeEach(function () {
    mockChain = {
      toConfig: sinon.stub().returns({})
    };
    mockGasket = {
      execApplySync: sinon.stub().callsFake((name, callback) => {
        if (name === 'webpackChain') {
          webpackChainCb = callback;
          return mockChain;
        } else if (name === 'webpack') {
          webpackCb = callback;
          return [{}];
        }
      }),
      logger: {
        warning: sinon.stub()
      },
      config: {}
    };
    mockContext = {};
    mockConfig = {};

    smartStub = sinon.stub().callsFake(deprecatedSmartMerge);
    deprecatedMerges = proxyquire('../lib/deprecated-merges', {
      'webpack-merge': {
        smart: smartStub
      }
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  it('returns webpack config object', function () {
    const results = deprecatedMerges(mockGasket, mockConfig, mockContext);
    assume(results).is.an('object');
  });

  it('smart merges', function () {
    deprecatedMerges(mockGasket, mockConfig, mockContext);
    assume(smartStub).called();
  });

  describe('gasket.config.webpack', function () {

    it('logs deprecated warning if set', function () {
      mockGasket.config.webpack = {};
      deprecatedMerges(mockGasket, mockConfig, mockContext);
      assume(mockGasket.logger.warning).calledWithMatch(/DEPRECATED `webpack` in Gasket config/);
    });

    it('does not log warning if not set', function () {
      deprecatedMerges(mockGasket, mockConfig, mockContext);
      assume(mockGasket.logger.warning).not.called();
    });
  });

  describe('webpackChain', function () {

    beforeEach(function () {
      deprecatedMerges(mockGasket, mockConfig, mockContext);
    });

    it('logs deprecated warning', function () {
      webpackChainCb({ name: 'mock-plugin' }, sinon.stub());
      assume(mockGasket.logger.warning).calledWithMatch(/DEPRECATED `webpackChain` lifecycle/);
    });

    it('logs plugin name', function () {
      webpackChainCb({ name: 'mock-plugin' }, sinon.stub());
      assume(mockGasket.logger.warning).calledWithMatch(/mock-plugin/);
    });

    it('logs unnamed plugin', function () {
      webpackChainCb({}, sinon.stub());
      assume(mockGasket.logger.warning).calledWithMatch(/unnamed plugin/);
    });

    it('logs app lifecycle', function () {
      // eslint-disable-next-line no-undefined
      webpackChainCb(undefined, sinon.stub());
      assume(mockGasket.logger.warning).calledWithMatch(/app lifecycle/);
    });
  });

  describe('webpack', function () {

    beforeEach(function () {
      deprecatedMerges(mockGasket, mockConfig, mockContext);
    });

    it('logs deprecated warning', function () {
      webpackCb({ name: 'mock-plugin' }, sinon.stub());
      assume(mockGasket.logger.warning).calledWithMatch(/DEPRECATED `webpack` lifecycle/);
    });

    it('logs plugin name', function () {
      webpackCb({ name: 'mock-plugin' }, sinon.stub());
      assume(mockGasket.logger.warning).calledWithMatch(/mock-plugin/);
    });

    it('logs unnamed plugin', function () {
      webpackCb({}, sinon.stub());
      assume(mockGasket.logger.warning).calledWithMatch(/unnamed plugin/);
    });

    it('logs app lifecycle', function () {
      // eslint-disable-next-line no-undefined
      webpackCb(undefined, sinon.stub());
      assume(mockGasket.logger.warning).calledWithMatch(/app lifecycle/);
    });
  });
});
