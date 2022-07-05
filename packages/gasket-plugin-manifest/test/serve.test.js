const assume = require('assume');
const sinon = require('sinon');

const serve = require('../lib/serve');

describe('serve', function () {
  afterEach(function () {
    sinon.reset();
  });

  it('is a function', function () {
    assume(serve).is.a('asyncfunction');
    assume(serve).has.length(2);
  });

  it('adds a route to the express/fastify server', async function () {
    const app = {
      get: sinon.stub()
    };

    await serve({}, app);
    assume(app.get.calledOnce).is.true();
  });

  it('returns the configured manifest on the route /manifest.json when path option is not set', async function (done) {
    const stub = sinon.stub();
    const get = function (route, f) {
      assume(route).equals('/manifest.json');
      f({}, { send: stub });
      assume(stub.calledOnce);
      done();
    };

    const app = { get };
    await serve({}, app);
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
    const get = function (route, f) {
      assume(route).equals(customPath);
      f({}, { send: stub });
      assume(stub.calledOnce);
      done();
    };

    const app = { get };
    await serve(gasket, app);
  });
});
