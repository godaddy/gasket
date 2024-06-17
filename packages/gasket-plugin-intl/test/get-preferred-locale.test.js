const getPreferredLocale = require('../lib/utils/get-preferred-locale');

describe('getPreferredLocale', () => {
  let req, mockHeaderLocale, mockGasket, mockDebug, mockDefaultLocale;

  beforeEach(() => {
    mockDebug = jest.fn();
    mockHeaderLocale = 'fr-FR';
    mockDefaultLocale = 'en-US';
    req = {
      headers: {
        'accept-language': mockHeaderLocale
      }
    };
    mockGasket = {
      config: {
        intl: {
          defaultLocale: mockDefaultLocale
        }
      },
      logger: {
        debug: mockDebug
      }
    };
  });

  it('returns the preferred locale from the request headers', () => {
    const result = getPreferredLocale(mockGasket, req);
    expect(result).toBe(mockHeaderLocale);
  });

  it('returns the default locale if no accept-language header', () => {
    req.headers['accept-language'] = null;
    const result = getPreferredLocale(mockGasket, req);
    expect(result).toBe(mockDefaultLocale);
  });

  it('passes first accept-language header', async function () {
    req.headers['accept-language'] = 'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5';
    const result = getPreferredLocale(mockGasket, req);
    expect(result).toBe('fr-CH');
  });

  it('formats accept-language to lower-UPPER', async function () {
    req.headers['accept-language'] = 'fr-fr';
    const result = getPreferredLocale(mockGasket, req);
    expect(result).toBe('fr-FR');
  });

  it('formats accept-language to lo-UP-Capitals', async function () {
    req.headers['accept-language'] = 'az-az-latn';
    const result = getPreferredLocale(mockGasket, req);
    expect(result).toBe('az-AZ-Latn');
  });

  it('passes defaultLocale if no accept-language header', async function () {
    delete req.headers['accept-language'];
    const result = getPreferredLocale(mockGasket, req);
    expect(result).toBe('en-US');
  });

  it('passes first accepted from supported locales', async function () {
    mockGasket.config.intl.locales = ['de'];
    req.headers['accept-language'] = 'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5';
    const result = getPreferredLocale(mockGasket, req);
    expect(result).toBe('de');
  });

  describe('when accept-language header is malformed', function () {

    beforeEach(function () {
      req.headers['accept-language'] = 'fr-CH;+malformed';
    });

    it('logs a debug message', async function () {
      getPreferredLocale(mockGasket, req);
      expect(mockGasket.logger.debug).toHaveBeenCalled();
    });

    it('passes defaultLocale with supported locales', async function () {
      mockGasket.config.intl.locales = ['de'];
      const result = getPreferredLocale(mockGasket, req);
      expect(result).toBe('en-US');
    });

    it('passes defaultLocale without supported locales', async function () {
      const result = getPreferredLocale(mockGasket, req);
      expect(result).toBe('en-US');
    });
  });
});
