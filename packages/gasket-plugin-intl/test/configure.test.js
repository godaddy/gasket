const configure = require('../lib/configure');
const { getIntlConfig } = configure;

describe('configure', function () {
  let mockGasket;

  const root = '/path/to/root';

  beforeEach(function () {
    mockGasket = {
      logger: {
        warn: jest.fn(),
        debug: jest.fn()
      },
      config: {
        root,
        intl: {
          locales: ['en-US', 'fr-FR', 'ar-AE']
        }
      }
    };
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('returns object', function () {
    const results = configure(mockGasket, mockGasket.config);
    expect(typeof results).toBe('object');
  });

  it('merges user config with defaults', function () {
    mockGasket.config.intl.user = 'stuff';
    const results = configure(mockGasket, mockGasket.config);
    expect(results.intl).toEqual({
      user: 'stuff',
      defaultLocaleFilePath: 'locales',
      staticLocaleFilePaths: ['locales'],
      locales: ['en-US', 'fr-FR', 'ar-AE'],
      defaultLocale: 'en-US',
      localesMap: {},
      localesDir: 'locales',
      fullLocalesDir: '/path/to/root/locales',
      managerFilename: 'intl.js',
      modules: false
    });
  });

  it('user config overrides defaults', function () {
    mockGasket.config.intl.user = 'stuff';
    mockGasket.config.intl.defaultLocale = 'fr-FR';
    const results = configure(mockGasket, mockGasket.config);
    expect(results.intl).toEqual({
      user: 'stuff',
      defaultLocaleFilePath: 'locales',
      staticLocaleFilePaths: ['locales'],
      locales: ['en-US', 'fr-FR', 'ar-AE'],
      defaultLocale: 'fr-FR',
      localesMap: {},
      localesDir: 'locales',
      fullLocalesDir: '/path/to/root/locales',
      managerFilename: 'intl.js',
      modules: false
    });
  });

  it('configures defaultLocaleFilePath if not set', () => {
    mockGasket.config.intl.defaultLocaleFilePath = 'locales/nested';
    const results = configure(mockGasket, mockGasket.config);
    expect(results.intl.defaultLocaleFilePath).toEqual('locales/nested');

    delete mockGasket.config.intl.defaultLocaleFilePath;
    const results2 = configure(mockGasket, mockGasket.config);
    expect(results2.intl.defaultLocaleFilePath).toEqual('locales');
  });

  it('configures locales if not set', () => {
    const results = configure(mockGasket, mockGasket.config);
    expect(results.intl.locales).toEqual(['en-US', 'fr-FR', 'ar-AE']);

    delete mockGasket.config.intl.locales;
    const results2 = configure(mockGasket, mockGasket.config);
    expect(results2.intl.locales).toEqual(['en-US']);

    expect(mockGasket.logger.debug)
      .toHaveBeenCalledWith(expect.stringContaining('intl.locales not configured'));
  });

  it('configures defaultLocale if not set', () => {
    mockGasket.config.intl.defaultLocale = 'fr-FR';
    const results = configure(mockGasket, mockGasket.config);
    expect(results.intl.defaultLocale).toEqual('fr-FR');

    delete mockGasket.config.intl.defaultLocale;
    const results2 = configure(mockGasket, mockGasket.config);
    expect(results2.intl.defaultLocale).toEqual('en-US');

    expect(mockGasket.logger.debug)
      .toHaveBeenCalledWith(expect.stringContaining('intl.defaultLocale not configured'));
  });

  it('configures staticLocaleFilePaths if not set', () => {
    mockGasket.config.intl.staticLocaleFilePaths = ['locales/nested'];
    const results = configure(mockGasket, mockGasket.config);
    expect(results.intl.staticLocaleFilePaths).toEqual(['locales/nested']);

    delete mockGasket.config.intl.staticLocaleFilePaths;
    const results2 = configure(mockGasket, mockGasket.config);
    expect(results2.intl.staticLocaleFilePaths).toEqual(['locales']);

    expect(mockGasket.logger.debug)
      .toHaveBeenCalledWith(expect.stringContaining('intl.staticLocaleFilePaths not configured'));
  });

  describe('getIntlConfig', function () {
    it('returns intl config from gasket instance', function () {
      const results = getIntlConfig(mockGasket);

      expect(results).toEqual({
        locales: ['en-US', 'fr-FR', 'ar-AE']
      });
    });
  });
});
