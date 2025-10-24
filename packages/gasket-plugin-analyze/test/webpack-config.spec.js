import webpack from '../lib/webpack-config.js';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

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

  it('returns updated webpack config object', async () => {
    results = await webpack(mockGasket,
      { ...mockWebpackConfig, bogus: 'BOGUS' }, mockNextData);
    expect(results).toHaveProperty('bogus', 'BOGUS');
    expect(results).toHaveProperty('plugins', expect.any(Array));
  });

  it('adds BundleAnalyzerPlugin to plugins when Gasket sub env is analyze', async () => {
    mockGasket.config.env = 'test.analyze';
    results = await webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin).toBeInstanceOf(BundleAnalyzerPlugin);
  });

  it('adds BundleAnalyzerPlugin to plugins when process.env.ANALYZE=1', async () => {
    process.env.ANALYZE = '1';
    results = await webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin).toBeInstanceOf(BundleAnalyzerPlugin);
  });

  it('adds BundleAnalyzerPlugin to plugins when process.env.ANALYZE=true', async () => {
    process.env.ANALYZE = 'true';
    results = await webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin).toBeInstanceOf(BundleAnalyzerPlugin);
  });

  it('does not add BundleAnalyzerPlugin if no Gasket sub env analyze', async () => {
    mockGasket.config.env = 'test.only';
    results = await webpack(mockGasket, mockWebpackConfig, mockNextData);
    expect(results).toBe(mockWebpackConfig);
  });

  it('does not add BundleAnalyzerPlugin if no ANALYZE', async () => {
    delete process.env.ANALYZE;
    results = await webpack(mockGasket, mockWebpackConfig, mockNextData);
    expect(results).toBe(mockWebpackConfig);
  });

  it('does not add BundleAnalyzerPlugin if ANALYZE=false', async () => {
    process.env.ANALYZE = 'false';
    results = await webpack(mockGasket, mockWebpackConfig, mockNextData);
    expect(results).toBe(mockWebpackConfig);
  });

  it('does not add BundleAnalyzerPlugin if ANALYZE=0', async () => {
    process.env.ANALYZE = '0';
    results = await webpack(mockGasket, mockWebpackConfig, mockNextData);
    expect(results).toBe(mockWebpackConfig);
  });

  it('uses bundleAnalyzerConfig options from gasket.config', async () => {
    mockGasket.config.env = 'test.analyze';
    mockGasket.config.bundleAnalyzerConfig = {
      browser: {
        reportFilename: 'bogus.html'
      }
    };
    results = await webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin.opts).toHaveProperty('reportFilename', 'bogus.html');
  });

  it('defaults analyzerMode=static', async () => {
    mockGasket.config.env = 'test.analyze';
    results = await webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin.opts).toHaveProperty('analyzerMode', 'static');
  });

  it('defaults output to reports dir', async () => {
    mockGasket.config.env = 'test.analyze';
    results = await webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin.opts).toHaveProperty('reportFilename', expect.stringContaining('/reports'));
  });

  it('allows browser config overrides', async () => {
    mockGasket.config.env = 'test.analyze';
    mockGasket.config.bundleAnalyzerConfig = {
      browser: {
        analyzerMode: 'server'
      }
    };
    results = await webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin.opts).toHaveProperty('analyzerMode', 'server');
  });

  it('allows server config overrides', async () => {
    mockGasket.config.env = 'test.analyze';
    mockGasket.config.bundleAnalyzerConfig = {
      server: {
        analyzerMode: 'server'
      }
    };
    results = await webpack(mockGasket, mockWebpackConfig,
      { ...mockNextData, isServer: true });
    const expectedPlugin = results.plugins[results.plugins.length - 1];
    expect(expectedPlugin.opts).toHaveProperty('analyzerMode', 'server');
  });
});
