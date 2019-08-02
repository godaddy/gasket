const plugin = require('./index');

const rootPath = process.cwd();
const mockReduxConfig = { makeStore: './path/to/some-file.js' };

describe('Plugin', () => {
  let results, mockGasket;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: rootPath
      }
    };
  });

  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has hooks', () => {
    expect(plugin).toHaveProperty('hooks');
    expect(plugin.hooks).toBeInstanceOf(Object);
  });

  describe('create', () => {
    it('has expected hook', () => {
      expect(plugin.hooks).toHaveProperty('create', expect.any(Function));
    });

    it('adds the expected dependencies', async function () {
      const spy = {
        pkg: { add: jest.fn() }
      };

      await plugin.hooks.create({}, spy);
      expect(spy.pkg.add).toHaveBeenCalledWith('dependencies', {
        '@gasket/redux': '^2.0.0',
        'react-redux': '^5.0.7',
        'redux': '^3.7.2'
      });
    });
  });

  describe('middleware', () => {
    it('has expected hook', () => {
      expect(plugin.hooks).toHaveProperty('middleware', expect.any(Function));
    });

    it('returns middleware function', () => {
      results = plugin.hooks.middleware(mockGasket);
      expect(results).toBeInstanceOf(Function);
    });
  });

  describe('webpack', () => {
    it('has expected hook', () => {
      expect(plugin.hooks).toHaveProperty('webpack', expect.any(Function));
    });

    it('retains the base webpack config if no make store method exists', () => {
      results = plugin.hooks.webpack(mockGasket, { bogus: 'BOGUS' });
      expect(results).toBeFalsy();
    });

    it('safely adds alias to webpack config', () => {
      mockGasket.config.redux = mockReduxConfig;

      results = plugin.hooks.webpack(mockGasket, {});
      expect(results).toHaveProperty('resolve');
      expect(results.resolve).toHaveProperty('alias');
    });

    it('set make-store alias if redux.makeStore in config', () => {
      mockGasket.config.redux = mockReduxConfig;

      results = plugin.hooks.webpack(mockGasket, {});
      expect(results.resolve.alias).toHaveProperty('@gasket/redux/make-store', `${rootPath}/path/to/some-file.js`);
    });
  });
});
