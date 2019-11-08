const plugin = require('../');
const assume = require('assume');
const sinon = require('sinon');

describe('Plugin', function () {

  it('is an object', () => {
    assume(plugin).is.an('object');
  });

  it('has expected name', () => {
    assume(plugin).to.have.property('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'express',
      'middleware'
    ];

    assume(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
  });
});

describe('#hooks.middleware', function () {
  const { middleware } = plugin.hooks;
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
      await fn(req, {}, () => {});
      assume(gasket.execWaterfall.calledOnce).is.true();
    });

    it('gathers manifest data if looking for the service worker script', async function () {
      const fn = handler(gasket, {});
      const req = {
        path: 'sw.js'
      };
      await fn(req, {}, () => {});
      assume(gasket.execWaterfall.calledOnce).is.true();
    });

    it('passes the incoming request to the manifest hook', async function () {
      const fn = handler(gasket, {}, {});
      const req = {
        path: 'manifest.json'
      };
      await fn(req, {}, () => {});
      assume(gasket.execWaterfall.args[0]).has.length(3);
      assume(gasket.execWaterfall.args[0][2]).deep.equals({ req });
    });

    it('uses the default configuration', async function () {
      const fn = handler(gasket, {}, {});
      const req = {
        path: 'manifest.json'
      };
      await fn(req, {}, () => {});
      assume(gasket.execWaterfall.args[0][1].display).equals('standalone');
    });

    it('takes precedence from gasket config over base config', async function () {
      gasket.config.manifest.display = 'BOGUS';
      const fn = handler(gasket, {}, {});
      const req = {
        path: 'manifest.json'
      };
      await fn(req, {}, () => {});
      assume(gasket.execWaterfall.args[0][1].display).equals('BOGUS');
    });
  });
});

describe('#hooks.express', function () {
  const { express } = plugin.hooks;

  it('is a function', function () {
    assume(express).is.a('asyncfunction');
    assume(express).has.length(2);
  });

  it('adds a route to the express server', async function () {
    const app = {
      get: sinon.stub()
    };

    await express({}, app);
    assume(app.get.calledOnce).is.true();
  });

  it('returns the configured manifest on the route /manifest.json when path option is not set', async function (done) {
    const stub = sinon.stub();
    const get = (route, f) => {
      assume(route).equals('/manifest.json');
      f({}, { send: stub });
      assume(stub.calledOnce);
      done();
    };

    const app = { get };
    await express({}, app);
  });

  it('returns the configured manifest on the configured path if option is set', async function (done) {
    const customPath = '/some/custom/path';
    const gasket = {
      config: {
        manifest: {
          path: customPath
        }
      }
    };

    const stub = sinon.stub();
    const get = (route, f) => {
      assume(route).equals(customPath);
      f({}, { send: stub });
      assume(stub.calledOnce);
      done();
    };

    const app = { get };
    await express(gasket, app);
  });
});
