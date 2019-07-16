const { describe, it } = require('mocha');
const proxyquire = require('proxyquire').noCallThru();
const assume = require('assume');
const { stub } = require('sinon');

describe('createSSR', () => {
  let gasket, nextInstance, nextHandler, nextRoutes, nextRoutesHandler, express;

  beforeEach(() => {
    nextHandler = stub();
    nextInstance = {
      getRequestHandler: stub().returns(nextHandler)
    };

    gasket = {
      config: {
        root: '/app/path'
      },
      exec: stub().resolves([nextInstance])
    };

    express = { set: stub() };

    nextRoutesHandler = stub();
    nextRoutes = {
      getRequestHandler: stub().returns(nextRoutesHandler)
    };
  });

  it('returns the next handler if no `routes.js` exists', async () => {
    const createSSR = importModule();

    const ssrList = await createSSR(gasket, express, true);

    assume(nextRoutes.getRequestHandler).is.not.called();
    assume(ssrList).deep.equals([nextHandler]);
  });

  it('returns the next-routes handler if `routes.js` exists', async () => {
    const createSSR = importModule({
      '/app/path/routes': nextRoutes
    });

    const ssrList = await createSSR(gasket, express, true);

    assume(nextRoutes.getRequestHandler).is.calledWith(nextInstance);
    assume(ssrList).deep.equals([nextRoutesHandler]);
  });

  it('does not swallow errors if `routes.js` has an error', async () => {
    const routesRuntimeError = new Error('Unexpected keyword "import"');
    const createSSR = importModule({
      '/app/path/routes': {
        get default() {
          throw routesRuntimeError;
        }
      }
    });

    let error;
    try {
      await createSSR(gasket, express, true);
    } catch (err) {
      error = err;
    }
    assume(error).equals(routesRuntimeError);
  });

  it('supports ES6-style modules', async () => {
    const createSSR = importModule({
      '/app/path/routes': {
        default: nextRoutes
      }
    });

    const ssrList = await createSSR(gasket, express, true);

    assume(nextRoutes.getRequestHandler).is.calledWith(nextInstance);
    assume(ssrList).deep.equals([nextRoutesHandler]);
  });

  it('supports a custom routes path', async () => {
    gasket.config.routes = './lib/routes';
    const createSSR = importModule({
      '/app/path/lib/routes': nextRoutes
    });

    const ssrList = await createSSR(gasket, express, true);

    assume(nextRoutes.getRequestHandler).is.calledWith(nextInstance);
    assume(ssrList).deep.equals([nextRoutesHandler]);
  });

  function importModule(dependencies = {}) {
    return proxyquire('../../ssr', {
      ...dependencies
    });
  }
});
