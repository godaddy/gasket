/* eslint-disable require-atomic-updates, max-statements */
const path = require('path');
const middlewareHook = require('../lib/middleware');

describe('middleware', function () {
  let mockGasket;

  beforeEach(function () {
    mockGasket = {
      execWaterfall: jest.fn().mockImplementation((lifecycle, locale) => Promise.resolve(locale)),
      config: {
        intl: {
          defaultLocale: 'en-US',
          localesMap: {
            'fr-CH': 'fr-FR'
          },
          localesDir: path.join(__dirname, 'fixtures', 'locales'),
          manifestFilename: 'mock-manifest.json'
        }
      },
      logger: {
        debug: jest.fn()
      }
    };
  });

  afterEach(function () {
    // sinon.restore();
  });

  it('returns middleware function', function () {
    const results = middlewareHook(mockGasket);
    expect(results).toBeInstanceOf(Function);
    expect(results).toHaveProperty('name', 'intlMiddleware');
  });

  describe('middleware function', function () {
    let layer, req, res, next;

    beforeEach(function () {
      layer = middlewareHook(mockGasket);
      req = {
        headers: {
          'accept-language': 'fr-FR'
        }
      };
      res = { locals: {} };
      next = jest.fn();
    });

    it('preloadLocales is true', async function () {
      mockGasket.config.intl.preloadLocales = true;
      layer = middlewareHook(mockGasket);
      await layer(req, res, next);
      expect(mockGasket.execWaterfall).toHaveBeenCalledWith('intlLocale', 'fr-FR', { req, res });
    });

    it('executes expected lifecycle', async function () {
      await layer(req, res, next);
      expect(mockGasket.execWaterfall).toHaveBeenCalledWith('intlLocale', 'fr-FR', { req, res });
    });

    it('passes first accepted from supported locales', async function () {
      mockGasket.config.intl.locales = ['de'];

      layer = middlewareHook(mockGasket);
      req.headers['accept-language'] = 'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5';
      await layer(req, res, next);
      expect(mockGasket.execWaterfall).toHaveBeenCalledWith('intlLocale', 'de', { req, res });
    });

    it('passes first accept-language header', async function () {
      req.headers['accept-language'] = 'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5';
      await layer(req, res, next);
      expect(mockGasket.execWaterfall).toHaveBeenCalledWith('intlLocale', 'fr-CH', { req, res });
    });

    it('formats accept-language to lower-UPPER', async function () {
      req.headers['accept-language'] = 'fr-fr';
      await layer(req, res, next);
      expect(mockGasket.execWaterfall).toHaveBeenCalledWith('intlLocale', 'fr-FR', { req, res });
    });

    it('formats accept-language to lo-UP-Capitals', async function () {
      req.headers['accept-language'] = 'az-az-latn';
      await layer(req, res, next);
      expect(mockGasket.execWaterfall).toHaveBeenCalledWith('intlLocale', 'az-AZ-Latn', { req, res });
    });

    it('passes defaultLocale if no accept-language header', async function () {
      delete req.headers['accept-language'];
      await layer(req, res, next);
      expect(mockGasket.execWaterfall).toHaveBeenCalledWith('intlLocale', 'en-US', { req, res });
    });

    it('attaches gasketData to res.locals', async function () {
      await layer(req, res, next);
      expect(res.locals).toHaveProperty('gasketData');
      expect(res.locals.gasketData).toEqual({ intl: { locale: 'fr-FR' } });
    });

    it('gasketData has mapped locale if configured', async function () {
      // not mapped example
      req.headers['accept-language'] = 'fr-CA';
      await layer(req, res, next);
      expect(res.locals.gasketData).toEqual({ intl: { locale: 'fr-CA' } });

      // mapped example
      req.headers['accept-language'] = 'fr-CH';
      await layer(req, res, next);
      expect(res.locals.gasketData).toEqual({ intl: { locale: 'fr-FR' } });
    });

    it('res.locals.gasketData has basePath if configured', async function () {
      // not configured example
      await layer(req, res, next);
      expect(res.locals.gasketData.intl).not.toHaveProperty('basePath');

      // configured example
      mockGasket.config.intl.basePath = '/some/base/path';
      layer = middlewareHook(mockGasket);
      await layer(req, res, next);
      expect(res.locals.gasketData.intl).toHaveProperty('basePath', '/some/base/path');
    });

    it('res.locals has configured localesDir', async function () {
      layer = middlewareHook(mockGasket);
      await layer(req, res, next);
      expect(res.locals).toHaveProperty('localesDir', mockGasket.config.intl.localesDir);
    });

    describe('when accept-language header is malformed', function () {

      beforeEach(function () {
        req.headers['accept-language'] = 'fr-CH;+malformed';
      });

      it('logs a debug message', async function () {
        await layer(req, res, next);
        expect(mockGasket.logger.debug).toHaveBeenCalled();
      });

      it('passes defaultLocale with supported locales', async function () {
        mockGasket.config.intl.locales = ['de'];
        layer = middlewareHook(mockGasket);
        await layer(req, res, next);
        expect(mockGasket.execWaterfall).toHaveBeenCalledWith('intlLocale', 'en-US', { req, res });
      });

      it('passes defaultLocale without supported locales', async function () {
        layer = middlewareHook(mockGasket);
        await layer(req, res, next);
        expect(mockGasket.execWaterfall).toHaveBeenCalledWith('intlLocale', 'en-US', { req, res });
      });
    });

    describe('req.withLocaleRequired', function () {
      it('method is added to req', async function () {
        await layer(req, res, next);
        expect(req).toHaveProperty('withLocaleRequired');
      });

      it('add locale props to gasketData for default path', async function () {
        await layer(req, res, next);
        req.withLocaleRequired();
        expect(res.locals.gasketData.intl).toEqual({
          locale: 'fr-FR',
          messages: { 'fr-FR': { gasket_welcome: 'Bonjour!', gasket_learn: 'Apprendre Gasket' } },
          status: { '/locales/fr-FR.json': 'loaded' }
        });
      });

      it('adds locale props to gasketData for other path', async function () {
        await layer(req, res, next);
        req.withLocaleRequired('/locales/extra');
        expect(res.locals.gasketData.intl).toEqual({
          locale: 'fr-FR',
          messages: { 'fr-FR': { gasket_extra: 'Supplémentaire' } },
          status: { '/locales/extra/fr-FR.json': 'loaded' }
        });
      });

      it('merges with existing data', async function () {
        res.locals.gasketData = { intl: { bogus: true } };
        await layer(req, res, next);
        req.withLocaleRequired();
        req.withLocaleRequired('/locales/extra');
        expect(res.locals.gasketData.intl).toEqual({
          bogus: true,
          locale: 'fr-FR',
          messages: {
            'fr-FR': {
              gasket_welcome: 'Bonjour!',
              gasket_learn: 'Apprendre Gasket',
              gasket_extra: 'Supplémentaire'
            }
          },
          status: {
            '/locales/fr-FR.json': 'loaded',
            '/locales/extra/fr-FR.json': 'loaded'
          }
        });
      });
    });

    describe('req.selectLocaleMessage', function () {
      it('method is added to req', async function () {
        await layer(req, res, next);
        expect(req).toHaveProperty('selectLocaleMessage');
      });

      it('selects loaded message', async function () {
        await layer(req, res, next);
        req.withLocaleRequired();
        const results = req.selectLocaleMessage('gasket_welcome');
        expect(results).toEqual('Bonjour!');
      });

      it('falls back to message id if not loaded', async function () {
        await layer(req, res, next);
        const results = req.selectLocaleMessage('gasket_welcome');
        expect(results).toEqual('gasket_welcome');
      });

      it('used default message if set and message not loaded', async function () {
        await layer(req, res, next);
        const results = req.selectLocaleMessage('gasket_welcome', 'Welcome fallback');
        expect(results).toEqual('Welcome fallback');
      });
    });
  });
});
