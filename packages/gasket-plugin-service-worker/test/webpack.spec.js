const webpack = require('../lib/webpack');
const WebpackInjectPlugin = require('webpack-inject-plugin').default;

const mockNextData = {
  defaultLoaders: {}
};

describe('webpack', () => {
  let results, mockGasket, mockWebpackConfig;

  beforeEach(() => {
    mockGasket = {
      command: {
        id: 'build'
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

  it('adds WebpackInjectPlugin to plugins', () => {
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[0];
    expect(expectedPlugin).toBeInstanceOf(WebpackInjectPlugin);
  });

  it('does not add WebpackInjectPlugin if local command', () => {
    mockGasket.command.id = 'local';
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    expect(results).toBeNull();
  });

  it('does not add WebpackInjectPlugin if webpackRegister = false', () => {
    mockGasket.config.serviceWorker = { webpackRegister: false };
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    expect(results).toBeNull();
  });

  it('does not add WebpackInjectPlugin if isServer', () => {
    results = webpack(mockGasket, mockWebpackConfig, { ...mockNextData, isServer: true });
    expect(results).toBeNull();
  });

  it('defaults to all entries', () => {
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[0];
    expect(expectedPlugin.options.entryName).toBeUndefined();
  });

  it('only injects to singled named entry', () => {
    mockGasket.config.serviceWorker = { webpackRegister: 'main' };
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[0];
    const { entryName } = expectedPlugin.options;
    expect(entryName('bad')).toBe(false);
    expect(entryName('main')).toBe(true);
  });

  it('only injects to array of named entries', () => {
    mockGasket.config.serviceWorker = { webpackRegister: ['page1', 'page2'] };
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[0];
    const { entryName } = expectedPlugin.options;
    expect(entryName('bad')).toBe(false);
    expect(entryName('page1')).toBe(true);
    expect(entryName('page2')).toBe(true);
  });

  it('only injects to entries from callback', () => {
    mockGasket.config.serviceWorker = { webpackRegister: key => /page*/.test(key) };
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[0];
    const { entryName } = expectedPlugin.options;
    expect(entryName('bad')).toBe(false);
    expect(entryName('page1')).toBe(true);
    expect(entryName('page2')).toBe(true);
  });
});
