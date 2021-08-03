/* eslint-disable require-atomic-updates */
const assume = require('assume');
const sinon = require('sinon');
const path = require('path');
const middlewareHook = require('../lib/middleware');

describe('middleware', function () {
  let mockGasket;

  beforeEach(function () {
    mockGasket = {
      execWaterfall: sinon.stub().callsFake((lifecycle, locale) => Promise.resolve(locale)),
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
        warn: sinon.stub()
      }
    };
  });

  afterEach(function () {
    sinon.restore();
  });

  it('returns middleware function', function () {
    const results = middlewareHook(mockGasket);
    assume(results).instanceOf(Function);
    assume(results).property('name', 'intlMiddleware');
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
      next = sinon.stub();
    });

    it('executes expected lifecycle', async function () {
      await layer(req, res, next);
      assume(mockGasket.execWaterfall).calledWith('intlLocale', 'fr-FR', { req, res });
    });

    it('passes first accepted from supported locales', async function () {
      mockGasket.config.intl.locales = ['de'];
      layer = middlewareHook(mockGasket);
      req.headers['accept-language'] = 'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5';
      await layer(req, res, next);
      assume(mockGasket.execWaterfall).calledWith('intlLocale', 'de', { req, res });
    });

    it('passes first accept-header', async function () {
      req.headers['accept-language'] = 'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5';
      await layer(req, res, next);
      assume(mockGasket.execWaterfall).calledWith('intlLocale', 'fr-CH', { req, res });
    });

    it('passes defaultLocale if no accept-header', async function () {
      delete req.headers['accept-language'];
      await layer(req, res, next);
      assume(mockGasket.execWaterfall).calledWith('intlLocale', 'en-US', { req, res });
    });

    it('attaches gasketData to res.locals', async function () {
      await layer(req, res, next);
      assume(res.locals).property('gasketData');
      assume(res.locals.gasketData).eqls({ intl: { locale: 'fr-FR' } });
    });

    it('gasketData has mapped locale if configured', async function () {
      // not mapped example
      req.headers['accept-language'] = 'fr-CA';
      await layer(req, res, next);
      assume(res.locals.gasketData).eqls({ intl: { locale: 'fr-CA' } });

      // mapped example
      req.headers['accept-language'] = 'fr-CH';
      await layer(req, res, next);
      assume(res.locals.gasketData).eqls({ intl: { locale: 'fr-FR' } });
    });

    it('res.locals.gasketData has basePath if configured', async function () {
      // not configured example
      await layer(req, res, next);
      assume(res.locals.gasketData.intl).not.property('basePath');

      // configured example
      mockGasket.config.intl.basePath = '/some/base/path';
      layer = middlewareHook(mockGasket);
      await layer(req, res, next);
      assume(res.locals.gasketData.intl).property('basePath', '/some/base/path');
    });

    it('res.locals has configured localesDir', async function () {
      layer = middlewareHook(mockGasket);
      await layer(req, res, next);
      assume(res.locals).property('localesDir', mockGasket.config.intl.localesDir);
    });

    context('when preferredLocale exception is thrown', function () {
      it('logs a gasket warn log', async function () {
        req.headers['accept-language'] = new Error('mock error');
        await layer(req, res, next);
        assume(mockGasket.logger.warn).called();
      });
    });

    describe('req.withLocaleRequired', function () {
      it('method is added to req', async function () {
        await layer(req, res, next);
        assume(req).property('withLocaleRequired');
      });

      it('add locale props to gasketData for default path', async function () {
        await layer(req, res, next);
        req.withLocaleRequired();
        assume(res.locals.gasketData.intl).eqls({
          locale: 'fr-FR',
          messages: { 'fr-FR': { gasket_welcome: 'Bonjour!', gasket_learn: 'Apprendre Gasket' } },
          status: { '/locales/fr-FR.json': 'loaded' }
        });
      });

      it('adds locale props to gasketData for other path', async function () {
        await layer(req, res, next);
        req.withLocaleRequired('/locales/extra');
        assume(res.locals.gasketData.intl).eqls({
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
        assume(res.locals.gasketData.intl).eqls({
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
        assume(req).property('selectLocaleMessage');
      });

      it('selects loaded message', async function () {
        await layer(req, res, next);
        req.withLocaleRequired();
        const results = req.selectLocaleMessage('gasket_welcome');
        assume(results).eqls('Bonjour!');
      });

      it('falls back to message id if not loaded', async function () {
        await layer(req, res, next);
        const results = req.selectLocaleMessage('gasket_welcome');
        assume(results).eqls('gasket_welcome');
      });

      it('used default message if set and message not loaded', async function () {
        await layer(req, res, next);
        const results = req.selectLocaleMessage('gasket_welcome', 'Welcome fallback');
        assume(results).eqls('Welcome fallback');
      });
    });
  });
});
