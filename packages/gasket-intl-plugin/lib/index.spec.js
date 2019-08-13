const path = require('path');
const plugin = require('./index');

describe('plugin (index.js)', () => {
  let mockApp;

  beforeEach(() => {
    mockApp = {
      use: jest.fn(),
      get: jest.fn()
    };
  });

  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has hooks', () => {
    expect(plugin).toHaveProperty('hooks');
    expect(plugin.hooks).toBeInstanceOf(Object);
    expect(plugin.hooks).toHaveProperty('initReduxState', expect.any(Function));
    expect(plugin.hooks).toHaveProperty('create', expect.any(Function));
    expect(plugin.hooks).toHaveProperty('build', expect.any(Function));
    expect(plugin.hooks).toHaveProperty('express', expect.any(Function));
    expect(plugin.hooks).toHaveProperty('workbox', expect.any(Function));
  });

  describe('express', () => {
    it('supports locales endpoints with default base', () => {
      const gasketConfig = {
        config: {
          root: process.cwd()
        }
      };
      plugin.hooks.express(gasketConfig, mockApp);
      expect(mockApp.use).toHaveBeenCalledWith('/_locales', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/locales-manifest.json', expect.any(Function));
    });
  });

  describe('initReduxState', () => {
    it('adds intl settings to redux initState if specified', async () => {
      const gasketConfig = {
        config: {
          intl: {
            outputDir: 'some/output/dir',
            assetPrefix: 'https://some-cdn.com',
            languageMap: {
              'aa-AA': 'zz-ZZ',
              'bb-BB': 'yy-YY'
            },
            defaultLanguage: 'es-MX'
          }
        },
        execWaterfall: jest.fn().mockResolvedValue('fr-FR')
      };
      const req = {
        headers: {
          'accept-language': 'fr-FR,es-AR'
        }
      };
      const reduxState = await plugin.hooks.initReduxState(gasketConfig, {}, req);
      expect(reduxState).toEqual({
        intl: {
          assetPrefix: 'https://some-cdn.com',
          languageMap: {
            'aa-AA': 'zz-ZZ',
            'bb-BB': 'yy-YY'
          },
          language: 'fr-FR',
          defaultLanguage: 'es-MX'
        }
      });
      expect(gasketConfig.execWaterfall).toHaveBeenCalledWith('intlLanguage', 'fr-FR', req);
    });
    it('adds default intl settings if not specified', async () => {
      const gasketConfig = {
        config: {},
        execWaterfall: jest.fn().mockResolvedValue('fr-FR')
      };
      const req = {
        headers: {
          'accept-language': 'fr-FR,es-AR'
        }
      };
      const reduxState = await plugin.hooks.initReduxState(gasketConfig, {}, req);
      expect(reduxState).toEqual({
        intl: {
          assetPrefix: '',
          languageMap: {},
          language: 'fr-FR',
          defaultLanguage: 'en-US'
        }
      });
      expect(gasketConfig.execWaterfall).toHaveBeenCalledWith('intlLanguage', 'fr-FR', req);
    });
  });

  describe('create', () => {
    /*
     * Simple jest test-helper to assert created with a clean
     * set of spies.
     */
    function expectCreatedWith(assertFn) {
      return async function expectCreated() {
        const spy = {
          pkg: { add: jest.fn() },
          files: { add: jest.fn() }
        };

        await plugin.hooks.create({}, spy);
        assertFn(spy);
      };
    }

    it('adds the appropriate globs', expectCreatedWith(({ files }) => {
      const rootDir = path.join(__dirname, '..');
      expect(files.add).toHaveBeenCalledWith(
        `${rootDir}/generator/*`,
        `${rootDir}/generator/**/*`
      );
    }));

    it('adds the appropriate dependencies', expectCreatedWith(({ pkg }) => {
      expect(pkg.add).toHaveBeenCalledWith('dependencies', {
        '@gasket/intl': '^3.0.0'
      });
    }));
  });
});
