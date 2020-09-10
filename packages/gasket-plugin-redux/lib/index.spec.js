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

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'configure',
      'prompt',
      'create',
      'webpack',
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
        pkg: { add: jest.fn() },
        files: { add: jest.fn() }
      };

      await plugin.hooks.create({}, spy);
      expect(spy.files.add).toHaveBeenCalledWith(
        `${ __dirname }/../generator/*`,
        `${ __dirname }/../generator/**/*`
      );
    });
  });

  describe('webpack', () => {
    it('has expected hook', () => {
      expect(plugin.hooks).toHaveProperty('webpack', expect.any(Function));
    });

    it('adds GASKET_MAKE_STORE_FILE to EnvironmentPlugin', function () {
      mockGasket.config.redux = mockReduxConfig;

      results = plugin.hooks.webpack(mockGasket, {});
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
