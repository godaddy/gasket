const configure = require('../lib/configure');
const { getIntlConfig } = configure;

const setupGasket = (config) => ({
  config: {
    root: '/path/to/root',
    ...config
  }
});

describe('configure', function () {
  const root = '/path/to/root';
  const mockGasket = {
    logger: {
      warn: jest.fn()
    },
    config: {
      root
    }
  };

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('returns object', function () {
    const results = configure(mockGasket, { root });
    expect(typeof results).toBe('object');
  });

  it('adds intl to config', function () {
    const results = configure(mockGasket, { root });
    expect(results).toHaveProperty('intl');
  });

  it('merges user config with defaults', function () {
    const results = configure(mockGasket, { root, intl: { user: 'stuff' } });
    expect(results.intl).toEqual({
      user: 'stuff',
      defaultLocaleFilePath: 'locales',
      defaultLocale: 'en',
      localesMap: {},
      localesDir: '/path/to/root/locales',
      managerFilename: 'intl.js',
      modules: false
    });
  });

  it('user config overrides defaults', function () {
    const results = configure(mockGasket, {
      root,
      intl: {
        user: 'stuff',
        defaultLocale: 'en-US'
      }
    });
    expect(results.intl).toEqual({
      user: 'stuff',
      defaultLocaleFilePath: 'locales',
      defaultLocale: 'en-US',
      localesMap: {},
      localesDir: '/path/to/root/locales',
      managerFilename: 'intl.js',
      modules: false
    });
  });

  describe('getIntlConfig', function () {
    it('returns intl config from gasket.config.js', function () {
      const results = getIntlConfig(
        setupGasket({
          intl: {
            localesDir: 'custom/locales'
          }
        })
      );
      expect(results).toEqual({
        localesDir: 'custom/locales'
      });
    });

    it('returns default object if no intl config set', function () {
      const results = getIntlConfig({});
      expect(results).toEqual({
        localesDir: 'locales'
      });
    });
  });
});
