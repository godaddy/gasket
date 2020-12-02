const assume = require('assume');
const sinon = require('sinon');

const middleware = require('../lib/middleware');

describe('middleware', function () {
  const { timing, handler } = middleware;
  let gasket;

  beforeEach(() => {
    gasket = {
      execWaterfall: sinon.stub().resolves([]),
      config: {
        manifest: {
          name: 'Walter White',
          superpower: 'Chemistry'
        },
        serviceWorker: {
          url: 'sw.js'
        }
      },
      logger: {
        debug: sinon.stub()
      }
    };
  });

  describe('#timing', () => {

    it('is set to last', function () {
      assume(timing).property('last', true);
    });
  });

  describe('#handler', () => {

    it('is a function', function () {
      assume(handler).is.a('function');
      assume(handler).has.length(1);
    });

    it('returns middleware', function () {
      const fn = handler(gasket, {});
      assume(fn).is.an('asyncfunction');
      assume(fn).has.length(3);
    });

    it('gathers manifest data if looking for manifest.json', async function () {
      const fn = handler(gasket, {});
      const req = {
        path: 'manifest.json'
      };
      await fn(req, {}, () => { });
      assume(gasket.execWaterfall.calledOnce).is.true();
    });

    it('gathers manifest data if looking for the service worker script', async function () {
      const fn = handler(gasket, {});
      const req = {
        path: 'sw.js'
      };
      await fn(req, {}, () => { });
      assume(gasket.execWaterfall.calledOnce).is.true();
    });

    it('passes the incoming request to the manifest hook', async function () {
      const fn = handler(gasket, {}, {});
      const context = { req: { path: 'manifest.json', manifest: [] }, res: {} };
      const req = {
        path: 'manifest.json'
      };
      await fn(req, {}, () => { });
      assume(gasket.execWaterfall.args[0]).has.length(3);
      assume(gasket.execWaterfall.args[0][2]).deep.equals(context);
    });

    it('uses the default configuration', async function () {
      const fn = handler(gasket, {}, {});
      const req = {
        path: 'manifest.json'
      };
      await fn(req, {}, () => { });
      assume(gasket.execWaterfall.args[0][1].display).equals('standalone');
    });

    it('takes precedence from gasket config over base config', async function () {
      gasket.config.manifest.display = 'BOGUS';
      const fn = handler(gasket, {}, {});
      const req = {
        path: 'manifest.json'
      };
      await fn(req, {}, () => { });
      assume(gasket.execWaterfall.args[0][1].display).equals('BOGUS');
    });
  });
});
