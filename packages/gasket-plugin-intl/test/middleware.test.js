/* eslint-disable require-atomic-updates */
const assume = require('assume');
const sinon = require('sinon');
const plugin = require('../lib/index');

const { middleware: middlewareHook } = plugin.hooks;

describe('middleware', () => {
  let mockGasket;

  beforeEach(function () {
    mockGasket = {
      execWaterfall: sinon.stub().callsFake((lifecycle, locale) => Promise.resolve(locale)),
      config: {
        intl: {
          defaultLocale: 'en-US',
          localesMap: {
            'fr-CH': 'fr-FR'
          }
        }
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
      res = {};
      next = sinon.stub();
    });

    it('executes expected lifecycle', async function () {
      await layer(req, res, next);
      assume(mockGasket.execWaterfall).calledWith('intlLocale', 'fr-FR', req, res);
    });

    it('passes first accept-header', async function () {
      req.headers['accept-language'] = 'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5';
      await layer(req, res, next);
      assume(mockGasket.execWaterfall).calledWith('intlLocale', 'fr-CH', req, res);
    });

    it('passes defaultLocale if no accept-header', async function () {
      delete req.headers['accept-language'];
      await layer(req, res, next);
      assume(mockGasket.execWaterfall).calledWith('intlLocale', 'en-US', req, res);
    });

    it('attaches gasketData to res', async function () {
      await layer(req, res, next);
      assume(res).property('gasketData');
      assume(res.gasketData).eqls({ intl: { locale: 'fr-FR' } });
    });

    it('res.gasketData has mapped locale if configured', async function () {
      // not mapped example
      req.headers['accept-language'] = 'fr-CA';
      await layer(req, res, next);
      assume(res.gasketData).eqls({ intl: { locale: 'fr-CA' } });

      // mapped example
      req.headers['accept-language'] = 'fr-CH';
      await layer(req, res, next);
      assume(res.gasketData).eqls({ intl: { locale: 'fr-FR' } });
    });

    it('res.gasketData has basePath if configured', async function () {
      // not configured example
      await layer(req, res, next);
      assume(res.gasketData.intl).not.property('basePath');

      // configured example
      mockGasket.config.intl.basePath = '/some/base/path';
      layer = middlewareHook(mockGasket);
      await layer(req, res, next);
      assume(res.gasketData.intl).property('basePath', '/some/base/path');
    });
  });
});
