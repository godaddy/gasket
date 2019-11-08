/* eslint-disable no-sync */

const { stub } = require('sinon');
const assume = require('assume');
const plugin = require('../index');

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
    const expected = [];

    assume(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
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

  it('executes the `webpackChain` and `webpack` lifecycles', async function () {
    const webpackConfig = { ...baseWebpackConfig };
    await plugin.initWebpack(gasket, webpackConfig, data);

    assume(gasket.execSync.firstCall).has.been.calledWith('webpackChain');
    assume(gasket.execSync.secondCall).has.been.calledWith('webpack');
  });

  it('returns webpack config object', async function () {
    const webpackConfig = { ...baseWebpackConfig };
    const result = await plugin.initWebpack(gasket, webpackConfig, data);

    assume(result).is.an('object');
    assume(result).has.property('plugins');
    assume(result).has.property('module');
    assume(result).has.property('optimization');
    assume(result).has.property('node');
  });

  it('returns webpack config object with configs merged', async function () {
    const mockConfigs = [{ newConfig1: 'newConfig1Value' }, { newConfig2: 'newConfig2Value' }];
    gasket.execSync.withArgs('webpack').returns(mockConfigs);
    const webpackConfig = { ...baseWebpackConfig };
    const result = await plugin.initWebpack(gasket, webpackConfig, data);

    assume(result).is.an('object');
    assume(result).has.property('plugins');
    assume(result).has.property('module');
    assume(result).has.property('optimization');
    assume(result).has.property('node');
    assume(result).has.property('newConfig1');
    assume(result).has.property('newConfig2');
  });
});

function mockGasketApi() {
  return {
    execSync: stub().returns([]),
    config: {
      webpack: {}  // user specified webpack config
    }
  };
}
