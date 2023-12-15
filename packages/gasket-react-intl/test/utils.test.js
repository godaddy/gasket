import { LocaleUtils } from '@gasket/helper-intl';
import * as utils from '../src/utils';

jest.mock('../src/config', () => ({
  isBrowser: false,
  clientData: {},
  manifest: require('./fixtures/mock-manifest.json')
}));

describe('utils', () => {
  let mockConfig;

  beforeEach(() => {
    mockConfig = require('../src/config');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.window.gasketIntlLocale;
    delete global.navigator.languages;
  });

  it('exports localeUtils instance', () => {
    expect(utils).toHaveProperty('localeUtils');
    expect(utils.localeUtils).toBeInstanceOf(LocaleUtils);
  });

  describe('getActiveLocale', () => {
    it('returns defaultLocale from manifest', () => {
      const results = utils.getActiveLocale();
      expect(results).toEqual(mockConfig.manifest.defaultLocale);
    });

    it('returns locale from window property', () => {
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

    it('returns locale from clientData', () => {
      mockConfig.isBrowser = true;
      mockConfig.clientData.locale = 'fr';
      Object.defineProperty(global.navigator, 'languages', {
        value: ['jp'],
        configurable: true
      });
      const results = utils.getActiveLocale();
      expect(results).toEqual('fr');
    });

    it('returns locale from first navigator.languages', () => {
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
