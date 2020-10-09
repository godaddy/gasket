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

describe('configure', () => {
  const root = '/path/to/root';
  const mockGasket = {
    logger: {
      warn: sinon.stub()
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

  it('returns object', () => {
    const results = configure(mockGasket, { root });
    assume(results).is.an('object');
  });

  it('adds intl to config', () => {
    const results = configure(mockGasket, { root });
    assume(results).property('intl');
  });

  it('merges user config with defaults', () => {
    const results = configure(mockGasket, { root, intl: { user: 'stuff' } });
    assume(results.intl).eqls({
      user: 'stuff',
      basePath: '',
      localesPath: '/locales',
      defaultLocale: 'en',
      localesMap: {},
      localesDir: '/path/to/root/public/locales',
      manifestFilename: 'locales-manifest.json',
      modules: false
    });
  });

  it('user config overrides defaults', () => {
    const results = configure(mockGasket, { root, intl: { user: 'stuff', basePath: 'custom', defaultLocale: 'en-US' } });
    assume(results.intl).eqls({
      user: 'stuff',
      basePath: 'custom',
      localesPath: '/locales',
      defaultLocale: 'en-US',
      localesMap: {},
      localesDir: '/path/to/root/public/locales',
      manifestFilename: 'locales-manifest.json',
      modules: false
    });
  });

  it('adds env variables', () => {
    assume(process.env.GASKET_INTL_LOCALES_DIR).is.undefined;
    assume(process.env.GASKET_INTL_MANIFEST_FILE).is.undefined;
    const results = configure(mockGasket, { root });
    assume(process.env.GASKET_INTL_LOCALES_DIR).equals(results.intl.localesDir);
    assume(process.env.GASKET_INTL_MANIFEST_FILE).equals(
      path.join(results.intl.localesDir, results.intl.manifestFilename)
    );
  });

  it('logs deprecation warnings', () => {
    configure(mockGasket, { root, intl: { languageMap: { foo: 'bar' } } });
    assume(mockGasket.logger.warn).calledWithMatch('languageMap');

    configure(mockGasket, { root, intl: { defaultLanguage: 'fake' } });
    assume(mockGasket.logger.warn).calledWithMatch('defaultLanguage');
  });

  describe('getIntlConfig', () => {

    it('returns intl config from gasket.config.js', () => {
      const results = getIntlConfig(setupGasket({
        intl: {
          assetPrefix: 'BOGUS'
        }
      }));
      assume(results).eqls({
        assetPrefix: 'BOGUS'
      });
    });

    it('returns empty object if no intl config set', () => {
      const results = getIntlConfig({});
      assume(results).eqls({});
    });
  });
});
