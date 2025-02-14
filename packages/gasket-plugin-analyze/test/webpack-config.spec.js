const webpack = require('../lib/webpack-config');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const mockNextData = {
  defaultLoaders: {}
};

describe('webpackConfig', () => {
  let results, mockGasket, mockWebpackConfig;

  beforeEach(() => {
    mockGasket = {
      config: {
        env: 'test'
      }
    };
    mockWebpackConfig = { plugins: [] };
  });

  afterEach(() => {
    delete process.env.ANALYZE;
  });

  it('returns updated webpack config object', () => {
    results = webpack(mockGasket,
      { ...mockWebpackConfig, bogus: 'BOGUS' }, mockNextData);
    expect(results).toHaveProperty('bogus', 'BOGUS');
    expect(results).toHaveProperty('plugins', expect.any(Array));
  });

  it('adds BundleAnalyzerPlugin to plugins when Gasket sub env is analyze', () => {
    mockGasket.config.env = 'test.analyze';
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin).toBeInstanceOf(BundleAnalyzerPlugin);
  });

  it('adds BundleAnalyzerPlugin to plugins when process.env.ANALYZE=1', () => {
    process.env.ANALYZE = '1';
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin).toBeInstanceOf(BundleAnalyzerPlugin);
  });

  it('adds BundleAnalyzerPlugin to plugins when process.env.ANALYZE=true', () => {
    process.env.ANALYZE = 'true';
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin).toBeInstanceOf(BundleAnalyzerPlugin);
  });

  it('does not add BundleAnalyzerPlugin if no Gasket sub env analyze', () => {
    mockGasket.config.env = 'test.only';
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    expect(results).toBe(mockWebpackConfig);
  });

  it('does not add BundleAnalyzerPlugin if no ANALYZE', () => {
    delete process.env.ANALYZE;
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    expect(results).toBe(mockWebpackConfig);
  });

  it('does not add BundleAnalyzerPlugin if ANALYZE=false', () => {
    process.env.ANALYZE = 'false';
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    expect(results).toBe(mockWebpackConfig);
  });

  it('does not add BundleAnalyzerPlugin if ANALYZE=0', () => {
    process.env.ANALYZE = '0';
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    expect(results).toBe(mockWebpackConfig);
  });

  it('uses bundleAnalyzerConfig options from gasket.config', () => {
    mockGasket.config.env = 'test.analyze';
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
    mockGasket.config.env = 'test.analyze';
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin.opts).toHaveProperty('analyzerMode', 'static');
  });

  it('defaults output to reports dir', () => {
    mockGasket.config.env = 'test.analyze';
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin.opts).toHaveProperty('reportFilename', expect.stringContaining('/reports'));
  });

  it('allows browser config overrides', () => {
    mockGasket.config.env = 'test.analyze';
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
    mockGasket.config.env = 'test.analyze';
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
