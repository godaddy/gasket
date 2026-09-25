const webpack = require('../lib/webpack-config');
const { RegisterPlugin } = require('../lib/utils/register-plugin');

const mockNextData = {
  defaultLoaders: {}
};

describe('webpackConfig', () => {
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

  it('returns updated webpack config object', () => {
    results = webpack(mockGasket,
      { ...mockWebpackConfig, bogus: 'BOGUS' }, mockNextData);
    expect(results).toHaveProperty('bogus', 'BOGUS');
    expect(results).toHaveProperty('plugins', expect.any(Array));
  });

  it('adds RegisterPlugin to plugins', () => {
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[0];
    expect(expectedPlugin).toBeInstanceOf(RegisterPlugin);
  });

  it('does not add RegisterPlugin if local command', () => {
    mockGasket.config.command = 'local';
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    expect(results).toBe(mockWebpackConfig);
  });

  it('does not add RegisterPlugin if webpackRegister = false', () => {
    mockGasket.config.serviceWorker = { webpackRegister: false };
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    expect(results).toBe(mockWebpackConfig);
  });

  it('does not add RegisterPlugin if isServer', () => {
    results = webpack(mockGasket, mockWebpackConfig, { ...mockNextData, isServer: true });
    expect(results).toBe(mockWebpackConfig);
  });

  it('defaults to all entries', () => {
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[0];
    expect(expectedPlugin.filter('any')).toBe(true);
  });

  it('only injects to singled named entry', () => {
    mockGasket.config.serviceWorker = { webpackRegister: 'main' };
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[0];
    const { filter: entryName } = expectedPlugin;
    expect(entryName('bad')).toBe(false);
    expect(entryName('main')).toBe(true);
  });

  it('only injects to array of named entries', () => {
    mockGasket.config.serviceWorker = { webpackRegister: ['page1', 'page2'] };
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[0];
    const { filter: entryName } = expectedPlugin;
    expect(entryName('bad')).toBe(false);
    expect(entryName('page1')).toBe(true);
    expect(entryName('page2')).toBe(true);
  });

  it('only injects to entries from callback', () => {
    mockGasket.config.serviceWorker = { webpackRegister: key => /page*/.test(key) };
    results = webpack(mockGasket, mockWebpackConfig, mockNextData);
    const expectedPlugin = results.plugins[0];
    const { filter: entryName } = expectedPlugin;
    expect(entryName('bad')).toBe(false);
    expect(entryName('page1')).toBe(true);
    expect(entryName('page2')).toBe(true);
  });
});
