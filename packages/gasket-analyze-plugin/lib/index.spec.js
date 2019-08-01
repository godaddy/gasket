const plugin = require('./index');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const mockNextData = {
  defaultLoaders: {}
};

describe('Plugin', () => {
  let results, mockGasket, mockWebpackConfig;

  beforeEach(() => {
    mockGasket = {
      config: {
        analyze: true
      }
    };
    mockWebpackConfig = { plugins: [] };
  });

  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has hooks', () => {
    expect(plugin).toHaveProperty('hooks');
    expect(plugin.hooks).toBeInstanceOf(Object);
  });

  describe('webpack', () => {

    it('has expected hook', () => {
      expect(plugin.hooks).toHaveProperty('webpack', expect.any(Function));
    });

    it('returns new webpack config partial', () => {
      results = plugin.hooks.webpack(mockGasket,
        { ...mockWebpackConfig, bogus: 'BOGUS' }, mockNextData);
      expect(results).not.toHaveProperty('bogus', 'BOGUS');
      expect(results).toHaveProperty('plugins', expect.any(Array));
    });

    it('adds BundleAnalyzerPlugin to plugins', () => {
      results = plugin.hooks.webpack(mockGasket, mockWebpackConfig,
        mockNextData);
      const expectedPlugin = results.plugins[results.plugins.length - 1];
      expect(expectedPlugin).toBeInstanceOf(BundleAnalyzerPlugin);
    });

    it('does not add BundleAnalyzerPlugin if analyze flag not set', () => {
      mockGasket.config.analyze = false;
      results = plugin.hooks.webpack(mockGasket, mockWebpackConfig,
        mockNextData);
      expect(results).toBeNull();
    });

    it('uses bundleAnalyzerConfig options from gasket.config', () => {
      mockGasket.config.bundleAnalyzerConfig = {
        browser: {
          reportFilename: 'bogus.html'
        }
      };
      results = plugin.hooks.webpack(mockGasket, mockWebpackConfig,
        mockNextData);
      const expectedPlugin = results.plugins[results.plugins.length - 1];
      expect(expectedPlugin.opts).
        toHaveProperty('reportFilename', 'bogus.html');
    });

    it('defaults analyzerMode=static', () => {
      results = plugin.hooks.webpack(mockGasket, mockWebpackConfig,
        mockNextData);
      const expectedPlugin = results.plugins[results.plugins.length - 1];
      expect(expectedPlugin.opts).toHaveProperty('analyzerMode', 'static');
    });

    it('defaults output to reports dir', () => {
      results = plugin.hooks.webpack(mockGasket, mockWebpackConfig,
        mockNextData);
      const expectedPlugin = results.plugins[results.plugins.length - 1];
      expect(expectedPlugin.opts).
        toHaveProperty('reportFilename', expect.stringContaining('/reports'));
    });

    it('allows browser config overrides', () => {
      mockGasket.config.bundleAnalyzerConfig = {
        browser: {
          analyzerMode: 'server'
        }
      };
      results = plugin.hooks.webpack(mockGasket, mockWebpackConfig,
        mockNextData);
      const expectedPlugin = results.plugins[results.plugins.length - 1];
      expect(expectedPlugin.opts).toHaveProperty('analyzerMode', 'server');
    });

    it('allows server config overrides', () => {
      mockGasket.config.bundleAnalyzerConfig = {
        server: {
          analyzerMode: 'server'
        }
      };
      results = plugin.hooks.webpack(mockGasket, mockWebpackConfig,
        { ...mockNextData, isServer: true });
      const expectedPlugin = results.plugins[results.plugins.length - 1];
      expect(expectedPlugin.opts).toHaveProperty('analyzerMode', 'server');
    });
  });
  describe('create', () => {

    it('adds the analyze script', async () => {
      const add = jest.fn();
      await plugin.hooks.create(mockGasket, { pkg: { add } });
      expect(add).toHaveBeenCalledWith('scripts', {
        analyze: 'gasket analyze'
      });
    });
  });
});
