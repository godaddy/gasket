const webpack = require('webpack');
const plugin = require('../lib/index');
const { name, version, description } = require('../package');

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

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });

  it('has expected hooks', () => {
    const expected = [
      'configure',
      'prompt',
      'create',
      'webpackConfig',
      'middleware',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  describe('create', () => {
    it('has expected hook', () => {
      expect(plugin.hooks).toHaveProperty('create', expect.any(Function));
    });

    it('adds the expected dependencies', async function () {
      const { devDependencies } = require('../package');
      const spy = {
        useRedux: true,
        pkg: { add: jest.fn() },
        files: { add: jest.fn() }
      };

      await plugin.hooks.create({}, spy);
      expect(spy.pkg.add).toHaveBeenCalledWith('dependencies', {
        '@gasket/redux': devDependencies['@gasket/redux'],
        'react-redux': devDependencies['react-redux'],
        'redux': devDependencies.redux
      });
    });

    it('adds the expected files', async function () {
      const spy = {
        useRedux: true,
        pkg: { add: jest.fn() },
        files: { add: jest.fn() }
      };

      await plugin.hooks.create({}, spy);
      expect(spy.files.add).toHaveBeenCalledWith(
        `${ process.cwd() }/lib/../generator/*`,
        `${ process.cwd() }/lib/../generator/**/*`
      );
    });
  });

  describe('webpackConfig', () => {
    it('has expected hook', () => {
      expect(plugin.hooks).toHaveProperty('webpackConfig', expect.any(Function));
    });

    it('adds GASKET_MAKE_STORE_FILE to EnvironmentPlugin', function () {
      mockGasket.config.redux = mockReduxConfig;

      results = plugin.hooks.webpackConfig(mockGasket, {}, { webpack });
      expect(results).toHaveProperty('plugins', expect.arrayContaining([
        expect.objectContaining({
          defaultValues: {
            GASKET_MAKE_STORE_FILE: mockReduxConfig.makeStore
          }
        })
      ]));
    });

    it('merges with existing plugins', function () {
      mockGasket.config.redux = mockReduxConfig;
      const mockWebpackConfig = {
        plugins: [
          new webpack.EntryOptionPlugin(),
          new webpack.DynamicEntryPlugin()
        ]
      };

      results = plugin.hooks.webpackConfig(mockGasket, mockWebpackConfig, { webpack });
      expect(results.plugins).toHaveLength(3);
      expect(results).toHaveProperty('plugins', expect.arrayContaining([
        expect.objectContaining({
          defaultValues: {
            GASKET_MAKE_STORE_FILE: mockReduxConfig.makeStore
          }
        })
      ]));
    });

    it('merges with existing EnvironmentPlugin', function () {
      mockGasket.config.redux = mockReduxConfig;
      const mockWebpackConfig = {
        plugins: [
          new webpack.EnvironmentPlugin([
            'GASKET_BOGUS'
          ])
        ]
      };

      results = plugin.hooks.webpackConfig(mockGasket, mockWebpackConfig, { webpack });
      expect(results.plugins).toHaveLength(2);
      expect(results).toHaveProperty('plugins', expect.arrayContaining([
        expect.objectContaining({
          defaultValues: {
            GASKET_MAKE_STORE_FILE: mockReduxConfig.makeStore
          }
        })
      ]));
    });
  });
});
