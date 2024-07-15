const webpack = require('../lib/webpack-config');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const mockNextData = {
  defaultLoaders: {}
};

describe('webpackConfig', () => {
  let results, mockGasket, mockWebpackConfig;

  beforeEach(() => {
    mockGasket = {
      config: {}
    };
    mockWebpackConfig = { plugins: [] };
    process.env.ANALYZE = 'true';
  });

  it('returns updated webpack config object', () => {
    results = webpack(mockGasket,
      { ...mockWebpackConfig, bogus: 'BOGUS' }, mockNextData);
    expect(results).toHaveProperty('bogus', 'BOGUS');
    expect(results).toHaveProperty('plugins', expect.any(Array));
  });

  it('adds BundleAnalyzerPlugin to plugins', () => {
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin).toBeInstanceOf(BundleAnalyzerPlugin);
  });

  it('does not add BundleAnalyzerPlugin if not analyze script', () => {
    process.env.ANALYZE = 'bogus';
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    expect(results).toBe(mockWebpackConfig);
  });

  it('uses bundleAnalyzerConfig options from gasket.config', () => {
    mockGasket.config.bundleAnalyzerConfig = {
      browser: {
        reportFilename: 'bogus.html'
      }
    };
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin.opts).toHaveProperty('reportFilename', 'bogus.html');
  });

  it('defaults analyzerMode=static', () => {
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin.opts).toHaveProperty('analyzerMode', 'static');
  });

  it('defaults output to reports dir', () => {
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin.opts).toHaveProperty('reportFilename', expect.stringContaining('/reports'));
  });

  it('allows browser config overrides', () => {
    mockGasket.config.bundleAnalyzerConfig = {
      browser: {
        analyzerMode: 'server'
      }
    };
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin.opts).toHaveProperty('analyzerMode', 'server');
  });

  it('allows server config overrides', () => {
    mockGasket.config.bundleAnalyzerConfig = {
      server: {
        analyzerMode: 'server'
      }
    };
    results = webpack(mockGasket, mockWebpackConfig,
      { ...mockNextData, isServer: true });
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin.opts).toHaveProperty('analyzerMode', 'server');
  });
});
