const proxyquire = require('proxyquire');
const { spy, stub } = require('sinon');
const assume = require('assume');

// eslint-disable-next-line max-statements
describe('createServers', () => {
  let plugin;
  let express, app;
  let cookieParser, cookieParserMiddleware;
  let compression, compressionMiddleware;
  let gasket;

  beforeEach(() => {
    gasket = {
      config: {},
      exec: stub().resolves([])
    };

    app = { use: spy() };
    express = stub().returns(app);

    cookieParserMiddleware = spy();
    cookieParser = stub().returns(cookieParserMiddleware);

    compressionMiddleware = spy();
    compression = stub().returns(compressionMiddleware);

    plugin = proxyquire('./', {
      express,
      'cookie-parser': cookieParser,
      'compression': compression
    });
  });

  it('executes the `middleware` lifecycle', async function () {
    await plugin.hooks.createServers(gasket);
    assume(gasket.exec).has.been.calledWith('middleware', app);
  });

  it('executes the `express` lifecycle in dev', async function () {
    await plugin.hooks.createServers(gasket, true);
    assume(gasket.exec).has.been.calledWith('express', app, true);
  });

  it('executes the `express` lifecycle not in dev', async function () {
    await plugin.hooks.createServers(gasket, false);
    assume(gasket.exec).has.been.calledWith('express', app, false);
  });

  it('executes the `errorMiddleware` lifecycle', async function () {
    await plugin.hooks.createServers(gasket);
    assume(gasket.exec).has.been.calledWith('errorMiddleware');
  });

  it('executes the `middleware` lifecycle before the `express` lifecycle', async function () {
    await plugin.hooks.createServers(gasket);
    assume(gasket.exec.firstCall).has.been.calledWith('middleware', app);
    assume(gasket.exec.secondCall).has.been.calledWith('express', app);
  });

  it('executes the `errorMiddleware` lifecycle after the `express` lifecycle', async function () {
    await plugin.hooks.createServers(gasket);
    assume(gasket.exec.secondCall).has.been.calledWith('express', app);
    assume(gasket.exec.thirdCall).has.been.calledWith('errorMiddleware');
  });

  it('adds the errorMiddleware', async () => {
    const errorMiddlewares = [spy()];
    gasket.exec.withArgs('errorMiddleware').resolves(errorMiddlewares);

    await plugin.hooks.createServers(gasket);

    const errorMiddleware = findCall(
      app.use,
      (mw) => mw === errorMiddlewares[0]);
    assume(errorMiddleware).to.not.be.null();
  });

  it('adds the cookie-parser middleware before plugin middleware', async () => {
    await plugin.hooks.createServers(gasket);

    const cookieParserUsage = findCall(
      app.use,
      (mw) => mw === cookieParserMiddleware);
    assume(cookieParserUsage).to.not.be.null();

    const withEvent = event => calledEvent => calledEvent === event;
    const middlewareInjection = findCall(gasket.exec, withEvent('middleware'));
    const routeInjection = findCall(gasket.exec, withEvent('express'));

    // callId can be used to determine relative call ordering
    assume(cookieParserUsage.callId).to.be.lessThan(middlewareInjection.callId);
    assume(cookieParserUsage.callId).to.be.lessThan(routeInjection.callId);
  });

  it('adds the cookie-parser middleware with a excluded path', async () => {
    gasket.config.express = { excludedRoutesRegex: /^(?!\/_next\/)/ };
    await plugin.hooks.createServers(gasket);

    const cookieParserUsage = findCall(
      app.use,
      (path, mw) => mw === cookieParserMiddleware);
    assume(cookieParserUsage).to.not.be.null();
  });

  it('adds the compression middleware by default', async () => {
    await plugin.hooks.createServers(gasket);

    const compressionUsage = findCall(
      app.use,
      mw => mw === compressionMiddleware);
    assume(compressionUsage).to.not.be.null();
  });

  it('adds the compression middleware when enabled from gasket config', async () => {
    gasket.config.express = { compression: true };
    await plugin.hooks.createServers(gasket);

    const compressionUsage = findCall(
      app.use,
      mw => mw === compressionMiddleware);
    assume(compressionUsage).to.not.be.null();
  });

  it('does not add the compression middleware when disabled from gasket config', async () => {
    gasket.config.express = { compression: false };
    await plugin.hooks.createServers(gasket);

    const compressionUsage = findCall(
      app.use,
      mw => mw === compressionMiddleware);
    assume(compressionUsage).to.be.null();
  });

  function findCall(aSpy, aPredicate) {
    const callIdx = aSpy.args.findIndex(args => aPredicate(...args));
    return callIdx === -1 ? null : aSpy.getCall(callIdx);
  }
});

describe('create', () => {

  let plugin, mockContext;

  function assumeCreatedWith(assertFn) {
    return async function assumeCreated() {
      await plugin.hooks.create({}, mockContext);
      assertFn(mockContext);
    };
  }

  beforeEach(() => {
    plugin = require('./');

    mockContext = {
      pkg: { add: spy() },
      files: { add: spy() }
    };
  });

  it('adds appropriate dependencies', assumeCreatedWith(({ pkg }) => {
    assume(pkg.add).calledWith('dependencies', {
      express: '^4.16.3'
    });
  }));
});
