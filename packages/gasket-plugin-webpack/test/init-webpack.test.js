/* eslint-disable no-sync */
const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const WebpackMetricsPlugin = require('../lib/webpack-metrics-plugin');


describe('deprecated merges', function () {
  let initWebpack, mockGasket, mockContext, mockConfig;

  beforeEach(function () {
    mockGasket = {
      execApplySync: sinon.stub(),
      logger: {
        warning: sinon.stub()
      }
    };
    mockContext = {};
    mockConfig = {};

    initWebpack = proxyquire('../lib/init-webpack', {
      './deprecated-merges': sinon.stub().callsFake((_, config) => config)
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  it('returns webpack config object', function () {
    const results = initWebpack(mockGasket, mockConfig, mockContext);
    assume(results).is.an('object');
  });

  it('configures webpack metrics plugin', function () {
    const results = initWebpack(mockGasket, mockConfig, mockContext);
    assume(results).property('plugins');
    assume(results.plugins[0]).instanceof(WebpackMetricsPlugin);
  });

  it('executes webpackConfig lifecycle', function () {
    initWebpack(mockGasket, mockConfig, mockContext);
    assume(mockGasket.execApplySync).calledWith('webpackConfig');
  });

  describe('webpackConfig lifecycle callback', function () {
    let applyFn, mockPlugin, handlerStub, baseConfig;

    beforeEach(function () {
      mockPlugin = { name: 'mock-plugin' };
      handlerStub = sinon.stub();

      baseConfig = initWebpack(mockGasket, {}, mockContext);
      applyFn = mockGasket.execApplySync.getCall(0).args[1];
    });

    it('called with baseConfig', function () {
      applyFn(mockPlugin, handlerStub);
      assume(handlerStub).calledWith(baseConfig);
    });

    it('called with context', function () {
      applyFn(mockPlugin, handlerStub);
      const context = handlerStub.getCall(0).args[1];
      assume(context).is.an('object');
    });

    // TODO: remove in next major version
    describe('context.webpackMerge', function () {
      it('getter logs deprecated warning', function () {
        applyFn(mockPlugin, handlerStub);
        const context = handlerStub.getCall(0).args[1];
        assume(mockGasket.logger.warning).not.called();
        context.webpackMerge;
        assume(mockGasket.logger.warning).calledWithMatch(/DEPRECATED/);
      });

      it('logs plugin name', function () {
        applyFn(mockPlugin, handlerStub);
        const context = handlerStub.getCall(0).args[1];
        context.webpackMerge;
        assume(mockGasket.logger.warning).calledWithMatch(/mock-plugin/);
      });

      it('logs recommendation', function () {
        applyFn(mockPlugin, handlerStub);
        const context = handlerStub.getCall(0).args[1];
        context.webpackMerge;
        assume(mockGasket.logger.warning).calledWithMatch(/Use `require\('webpack-merge'\)`/);
      });

      it('logs `unnamed plugin` if plugin name not set', function () {
        applyFn({}, handlerStub);
        const context = handlerStub.getCall(0).args[1];
        context.webpackMerge;
        assume(mockGasket.logger.warning).calledWithMatch(/unnamed plugin/);
      });

      it('logs app lifecycle', function () {
        // eslint-disable-next-line no-undefined
        applyFn(undefined, handlerStub);
        const context = handlerStub.getCall(0).args[1];
        context.webpackMerge;
        assume(mockGasket.logger.warning).calledWithMatch(/app lifecycle/);
      });
    });

    it('context.webpack returns webpack', function () {
      applyFn(mockPlugin, handlerStub);
      const context = handlerStub.getCall(0).args[1];
      assume(context.webpack).equals(require('webpack'));
    });

  });
});
