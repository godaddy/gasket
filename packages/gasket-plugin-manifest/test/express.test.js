const assume = require('assume');
const sinon = require('sinon');

const express = require('../lib/express');

describe('express', function () {
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
    const get = function (route, f) {
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
    const get = function (route, f) {
      assume(route).equals(customPath);
      f({}, { send: stub });
      assume(stub.calledOnce);
      done();
    };

    const app = { get };
    await express(gasket, app);
  });
});
