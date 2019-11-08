const webpack = require('./webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const mockNextData = {
  defaultLoaders: {}
};

describe('webpack', () => {
  let results, mockGasket, mockWebpackConfig;

  beforeEach(() => {
    mockGasket = {
      command: {
        id: 'analyze'
      },
      config: {}
    };
    mockWebpackConfig = { plugins: [] };
  });

  it('returns new webpack config partial', () => {
    results = webpack(mockGasket,
      { ...mockWebpackConfig, bogus: 'BOGUS' }, mockNextData);
    expect(results).not.toHaveProperty('bogus', 'BOGUS');
    expect(results).toHaveProperty('plugins', expect.any(Array));
  });

  it('adds BundleAnalyzerPlugin to plugins', () => {
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin).toBeInstanceOf(BundleAnalyzerPlugin);
  });

  it('does not add BundleAnalyzerPlugin if not analyze command', () => {
    mockGasket.command.id = 'bogus';
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    expect(results).toBeNull();
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
