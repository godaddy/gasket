const proxyquire = require('proxyquire').noCallThru();
const { spy, stub } = require('sinon');
const assume = require('assume');

describe('start', () => {
  let start, createServers;
  let createSSR, nextHandler;
  let expressApp, middleware;
  let gasket;

  beforeEach(() => {
    gasket = {
      exec: stub().resolves([{}]),
      execMap: stub().resolves(stub())
    };

    createServers = stub();

    nextHandler = spy();
    createSSR = stub().returns([{
      getRequestHandler: stub().returns(nextHandler)
    }]);

    middleware = [];
    expressApp = {
      all: spy((route, mw) => middleware.push(mw)),
      use: spy(mw => middleware.push(mw))
    };

    start = proxyquire('../../start', {
      './servers': createServers,
      './ssr': createSSR
    });
  });

  it('starts in dev mode if the `dev` option is `true`', async () => {
    gasket.exec.withArgs('expressCreate').resolves([expressApp]);
    await start(gasket, { dev: true });

    assume(createSSR).has.been.calledWith(gasket, expressApp, true);
  });

  it('starts in non-dev mode if the `dev` option is `false`', async () => {
    gasket.exec.withArgs('expressCreate').resolves([expressApp]);
    await start(gasket, { dev: false });

    assume(createSSR).has.been.calledWith(gasket, expressApp, false);
  });

  it('allows error-handling middleware to be injected', async () => {
    gasket.exec.withArgs('expressCreate').resolves([expressApp]);
    const errorMiddleware = (e, req, res, next) => next();
    gasket.exec.withArgs('errorMiddleware').returns([errorMiddleware]);

    await start(gasket, { });

    assume(expressApp.use).has.been.calledWith(errorMiddleware);
    assume(middleware.indexOf(nextHandler))
      .to.be.lessThan(middleware.indexOf(errorMiddleware));
  });
});
