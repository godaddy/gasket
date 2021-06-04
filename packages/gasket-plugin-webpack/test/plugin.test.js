/* eslint-disable no-sync */

const { stub } = require('sinon');
const assume = require('assume');
const webpackMerge = require('webpack-merge');
const plugin = require('../index');
const { devDependencies } = require('../package');

const baseWebpackConfig = {
  plugins: [],
  module: {
    rules: []
  },
  optimization: {
    splitChunks: {
      cacheGroups: {}
    },
    minimize: false
  }
};

describe('Plugin', () => {

  it('is an object', () => {
    assume(plugin).is.an('object');
  });

  it('has expected name', () => {
    assume(plugin).to.have.property('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'metadata'
    ];

    assume(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
  });
});

describe('create hook', () => {
  let mockContext;
  beforeEach(() => {

    mockContext = {
      pkg: {
        add: stub(),
        has: stub()
      }
    };
  });

  it('adds appropriate devDependencies', async function () {
    await plugin.hooks.create({}, mockContext);

    assume(mockContext.pkg.add).calledWith('devDependencies', {
      webpack: devDependencies.webpack
    });
  });
});

describe('initWebpack hook', () => {
  let gasket, data;

  beforeEach(() => {
    data = {
      defaultLoaders: {}
    };
    gasket = mockGasketApi();
  });

  it('executes the `webpackChain` and `webpack` lifecycles', function () {
    const webpackConfig = { ...baseWebpackConfig };
    plugin.initWebpack(gasket, webpackConfig, data);

    assume(gasket.execSync.firstCall).has.been.calledWith('webpackChain');
    assume(gasket.execSync.secondCall).has.been.calledWith('webpack');
  });

  it('returns webpack config object', function () {
    const webpackConfig = { ...baseWebpackConfig };
    const result = plugin.initWebpack(gasket, webpackConfig, data);

    assume(result).is.an('object');
    assume(result).has.property('plugins');
    assume(result).has.property('module');
    assume(result).has.property('optimization');
  });

  it('returns webpack config object with configs merged', function () {
    const mockConfigs = [{ newConfig1: 'newConfig1Value' }, { newConfig2: 'newConfig2Value' }];
    gasket.execSync.withArgs('webpack').returns(mockConfigs);
    const webpackConfig = { ...baseWebpackConfig };
    const result = plugin.initWebpack(gasket, webpackConfig, data);

    assume(result).is.an('object');
    assume(result).has.property('plugins');
    assume(result).has.property('module');
    assume(result).has.property('optimization');
    assume(result).has.property('newConfig1');
    assume(result).has.property('newConfig2');
  });

  it('does custom merging through a webpackMerge lifecycle', function () {
    const originalConfig = { ...baseWebpackConfig };
    const updatedConfig = { mock: 'config' };
    gasket.execWaterfallSync.withArgs('webpackMerge').returns(updatedConfig);

    const config = plugin.initWebpack(gasket, originalConfig, data);

    assume(gasket.execWaterfallSync)
      .has.been.calledWith('webpackMerge', originalConfig, data, webpackMerge);
    assume(config).equas(updatedConfig);
  });
});

function mockGasketApi() {
  return {
    execSync: stub().returns([]),
    execWaterfallSync: stub().returnsArg(1),
    config: {
      webpack: {}  // user specified webpack config
    }
  };
}
