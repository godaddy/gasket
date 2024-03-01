import { LocaleUtils } from '@gasket/helper-intl';
import * as utils from '../src/utils';

jest.mock('../src/config', () => ({
  isBrowser: false,
  clientData: {},
  manifest: require('./fixtures/mock-manifest.json')
}));

describe('utils', function () {
  let mockConfig;

  beforeEach(function () {
    mockConfig = require('../src/config');
  });

  afterEach(function () {
    jest.restoreAllMocks();
    delete global.window.gasketIntlLocale;
    delete global.navigator.languages;
  });

  it('exports localeUtils instance', function () {
    expect(utils).toHaveProperty('localeUtils');
    expect(utils.localeUtils).toBeInstanceOf(LocaleUtils);
  });

  describe('getActiveLocale', function () {
    it('returns defaultLocale from manifest', function () {
      const results = utils.getActiveLocale();
      expect(results).toEqual(mockConfig.manifest.defaultLocale);
    });

    it('returns locale from window property', function () {
      mockConfig.isBrowser = true;
      mockConfig.clientData.locale = 'fr';
      global.window.gasketIntlLocale = 'de';
      Object.defineProperty(global.navigator, 'languages', {
        value: ['jp'],
        configurable: true
      });
      const results = utils.getActiveLocale();
      expect(results).toEqual('de');
    });

    it('returns locale from clientData', function () {
      mockConfig.isBrowser = true;
      mockConfig.clientData.locale = 'fr';
      Object.defineProperty(global.navigator, 'languages', {
        value: ['jp'],
        configurable: true
      });
      const results = utils.getActiveLocale();
      expect(results).toEqual('fr');
    });

    it('returns locale from first navigator.languages', function () {
      mockConfig.isBrowser = true;
      mockConfig.clientData.locale = null;
      Object.defineProperty(global.navigator, 'languages', {
        value: ['jp'],
        configurable: true
      });
      const results = utils.getActiveLocale();
      expect(results).toEqual('jp');
    });
  });
});
