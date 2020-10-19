import assume from 'assume';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { LocaleUtils } from '@gasket/helper-intl';

describe('utils', function () {
  let mockConfig, utils;

  const getModule = () => {
    return proxyquire('../src/utils', {
      './config': mockConfig
    });
  };

  beforeEach(function () {
    mockConfig = { isBrowser: false, clientData: {}, manifest: require('./fixtures/mock-manifest.json') };
    utils = getModule();
  });

  afterEach(function () {
    sinon.restore();
    delete global.window.gasketIntlLocale;
    delete global.navigator.languages;
  });

  it('exports localeUtils instance', function () {
    assume(utils).property('localeUtils');
    assume(utils.localeUtils).instanceOf(LocaleUtils);
  });

  describe('getActiveLocale', function () {

    it('returns defaultLocale from manifest', function () {
      const results = utils.getActiveLocale();
      assume(results).equals(mockConfig.manifest.defaultLocale);
    });

    it('returns locale from window property', function () {
      mockConfig.isBrowser = true;
      mockConfig.clientData.locale = 'fr';
      global.window.gasketIntlLocale = 'de';
      global.navigator.languages = ['jp'];
      const results = utils.getActiveLocale();
      assume(results).equals('de');
    });

    it('returns locale from clientData', function () {
      mockConfig.isBrowser = true;
      mockConfig.clientData.locale = 'fr';
      global.navigator.languages = ['jp'];
      const results = getModule().getActiveLocale();
      assume(results).equals('fr');
    });

    it('returns locale from first navigator.languages', function () {
      mockConfig.isBrowser = true;
      global.navigator.languages = ['jp'];
      const results = utils.getActiveLocale();
      assume(results).equals('jp');
    });
  });
});
