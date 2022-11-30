/* eslint-disable no-process-env */
const assume = require('assume');
const sinon = require('sinon');
const path = require('path');
const configure = require('../lib/configure');
const { getIntlConfig } = configure;

const setupGasket = config => ({
  config: {
    root: '/path/to/root',
    ...config
  }
});

describe('configure', function () {
  const root = '/path/to/root';
  const mockGasket = {
    logger: {
      warning: sinon.stub()
    },
    config: {
      root
    }
  };

  afterEach(function () {
    delete process.env.GASKET_INTL_LOCALES_DIR;
    delete process.env.GASKET_INTL_MANIFEST_FILE;
    sinon.restore();
  });

  it('returns object', function () {
    const results = configure(mockGasket, { root });
    assume(results).is.an('object');
  });

  it('adds intl to config', function () {
    const results = configure(mockGasket, { root });
    assume(results).property('intl');
  });

  it('merges user config with defaults', function () {
    const results = configure(mockGasket, { root, intl: { user: 'stuff' } });
    assume(results.intl).eqls({
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
    assume(results.intl).eqls({
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
    assume(results.intl).property('basePath', 'from-root');
  });

  it('can use nextConfig.assetPrefix for basePath', function () {
    const results = configure(mockGasket, { root, nextConfig: { assetPrefix: 'from-next' } });
    assume(results.intl).property('basePath', 'from-next');
  });

  it('can use nextConfig.basePath for basePath', function () {
    const results = configure(mockGasket, { root, nextConfig: { basePath: 'from-next' } });
    assume(results.intl).property('basePath', 'from-next');
  });

  it(`intl.basePath can be empty string, overriding lesser configs`, function () {
    let results = configure(mockGasket, { root, intl: { basePath: '' }, nextConfig: { assetPrefix: 'from-next' } });
    assume(results.intl).property('basePath', '');

    results = configure(mockGasket, { root, basePath: 'from-root', intl: { basePath: '' } });
    assume(results.intl).property('basePath', '');
  });

  it('adds env variables', function () {
    assume(process.env.GASKET_INTL_LOCALES_DIR).is.undefined;
    assume(process.env.GASKET_INTL_MANIFEST_FILE).is.undefined;
    const results = configure(mockGasket, { root });
    assume(process.env.GASKET_INTL_LOCALES_DIR).equals(results.intl.localesDir);
    assume(process.env.GASKET_INTL_MANIFEST_FILE).equals(
      path.join(results.intl.localesDir, results.intl.manifestFilename)
    );
  });

  it('logs deprecation warnings', function () {
    configure(mockGasket, { root, intl: { languageMap: { foo: 'bar' } } });
    assume(mockGasket.logger.warning).calledWithMatch('languageMap');

    configure(mockGasket, { root, intl: { defaultLanguage: 'fake' } });
    assume(mockGasket.logger.warning).calledWithMatch('defaultLanguage');

    configure(mockGasket, { root, intl: { assetPrefix: 'fake' } });
    assume(mockGasket.logger.warning).calledWithMatch('assetPrefix');
  });

  describe('getIntlConfig', function () {

    it('returns intl config from gasket.config.js', function () {
      const results = getIntlConfig(setupGasket({
        intl: {
          localesDir: 'custom/locales',
          assetPrefix: 'BOGUS'
        }
      }));
      assume(results).eqls({
        localesDir: 'custom/locales',
        assetPrefix: 'BOGUS'
      });
    });

    it('returns default object if no intl config set', function () {
      const results = getIntlConfig({});
      assume(results).eqls({
        localesDir: path.join('public', 'locales')
      });
    });
  });
});
