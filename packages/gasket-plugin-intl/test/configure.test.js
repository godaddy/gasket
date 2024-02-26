/* eslint-disable no-process-env */
const path = require('path');
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
    delete process.env.GASKET_INTL_LOCALES_DIR;
    delete process.env.GASKET_INTL_MANIFEST_FILE;
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
      basePath: '',
      defaultPath: '/locales',
      defaultLocale: 'en',
      localesMap: {},
      localesDir: '/path/to/root/public/locales',
      manifestFilename: 'locales-manifest.json',
      preloadLocales: false,
      modules: false
    });
  });

  it('user config overrides defaults', function () {
    const results = configure(mockGasket, {
      root,
      intl: {
        user: 'stuff',
        basePath: 'custom',
        defaultLocale: 'en-US',
        preloadLocales: true
      }
    });
    expect(results.intl).toEqual({
      user: 'stuff',
      basePath: 'custom',
      defaultPath: '/locales',
      defaultLocale: 'en-US',
      localesMap: {},
      localesDir: '/path/to/root/public/locales',
      manifestFilename: 'locales-manifest.json',
      preloadLocales: true,
      modules: false
    });
  });

  it('can use root basePath', function () {
    const results = configure(mockGasket, { root, basePath: 'from-root' });
    expect(results.intl).toHaveProperty('basePath', 'from-root');
  });

  it('can use nextConfig.assetPrefix for basePath', function () {
    const results = configure(mockGasket, {
      root,
      nextConfig: { assetPrefix: 'from-next' }
    });
    expect(results.intl).toHaveProperty('basePath', 'from-next');
  });

  it('can use nextConfig.basePath for basePath', function () {
    const results = configure(mockGasket, {
      root,
      nextConfig: { basePath: 'from-next' }
    });
    expect(results.intl).toHaveProperty('basePath', 'from-next');
  });

  it(`intl.basePath can be empty string, overriding lesser configs`, function () {
    let results = configure(mockGasket, {
      root,
      intl: { basePath: '' },
      nextConfig: { assetPrefix: 'from-next' }
    });
    expect(results.intl).toHaveProperty('basePath', '');

    results = configure(mockGasket, {
      root,
      basePath: 'from-root',
      intl: { basePath: '' }
    });
    expect(results.intl).toHaveProperty('basePath', '');
  });

  it('adds env variables', function () {
    expect(process.env.GASKET_INTL_LOCALES_DIR).toBeUndefined();
    expect(process.env.GASKET_INTL_MANIFEST_FILE).toBeUndefined();
    const results = configure(mockGasket, { root });
    expect(process.env.GASKET_INTL_LOCALES_DIR).toEqual(
      results.intl.localesDir
    );
    expect(process.env.GASKET_INTL_MANIFEST_FILE).toEqual(
      path.join(results.intl.localesDir, results.intl.manifestFilename)
    );
  });

  describe('getIntlConfig', function () {
    it('returns intl config from gasket.config.js', function () {
      const results = getIntlConfig(
        setupGasket({
          intl: {
            localesDir: 'custom/locales',
            assetPrefix: 'BOGUS'
          }
        })
      );
      expect(results).toEqual({
        localesDir: 'custom/locales',
        assetPrefix: 'BOGUS'
      });
    });

    it('returns default object if no intl config set', function () {
      const results = getIntlConfig({});
      expect(results).toEqual({
        localesDir: path.join('public', 'locales')
      });
    });
  });
});
