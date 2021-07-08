const proxyquire = require('proxyquire');
const sinon = require('sinon');
const assume = require('assume');


const app = { use: sinon.spy() };
const express = sinon.stub().returns(app);
const bridgedApp = { use: sinon.spy() };
const expressBridge = sinon.stub().returns(bridgedApp);

const cookieParserMiddleware = sinon.spy();
const cookieParser = sinon.stub().returns(cookieParserMiddleware);

const compressionMiddleware = sinon.spy();
const compression = sinon.stub().returns(compressionMiddleware);

const plugin = proxyquire('../index', {
  express,
  'http2-express-bridge': expressBridge,
  'cookie-parser': cookieParser,
  'compression': compression
});

describe('Plugin', function () {

  it('is an object', () => {
    assume(plugin).is.an('object');
  });

  it('has expected name', () => {
    assume(plugin).to.have.property('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'createServers',
      'metadata'
    ];

    assume(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
  });
});

// eslint-disable-next-line max-statements
describe('createServers', () => {
  let gasket, lifecycles;

  beforeEach(() => {
    sinon.resetHistory();

    lifecycles = {
      middleware: sinon.stub().resolves([]),
      errorMiddleware: sinon.stub().resolves([]),
      express: sinon.stub().resolves()
    };

    gasket = {
      logger: {},
      config: {},
      exec: sinon.stub().callsFake((lifecycle, ...args) => lifecycles[lifecycle](args))
    };
  });

  it('returns the handler app', async function () {
    const result = await plugin.hooks.createServers(gasket, {});
    assume(result).deep.equals({ handler: app });
  });

  it('returns the handler as http2 bridge app', async function () {
    gasket.config.http2 = 8080;
    const result = await plugin.hooks.createServers(gasket);
    assume(result).deep.equals({ handler: bridgedApp });
  });

  it('executes the `middleware` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    assume(gasket.exec).has.been.calledWith('middleware', app);
  });

  it('executes the `express` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    assume(gasket.exec).has.been.calledWith('express', app);
  });

  it('executes the `errorMiddleware` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    assume(gasket.exec).has.been.calledWith('errorMiddleware');
  });

  it('executes the `middleware` lifecycle before the `express` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    assume(gasket.exec.firstCall).has.been.calledWith('middleware', app);
    assume(gasket.exec.secondCall).has.been.calledWith('express', app);
  });

  it('executes the `errorMiddleware` lifecycle after the `express` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    assume(gasket.exec.secondCall).has.been.calledWith('express', app);
    assume(gasket.exec.thirdCall).has.been.calledWith('errorMiddleware');
  });

  it('adds the errorMiddleware', async () => {
    const errorMiddlewares = [sinon.spy()];
    gasket.exec.withArgs('errorMiddleware').resolves(errorMiddlewares);

    await plugin.hooks.createServers(gasket, {});

    const errorMiddleware = findCall(
      app.use,
      (mw) => mw === errorMiddlewares[0]);
    assume(errorMiddleware).to.not.be.null();
  });

  it('setups up patch middleware for http2', async () => {
    gasket.config.http2 = 8080;
    await plugin.hooks.createServers(gasket, {});

    // Added as the first middleware
    const patchMiddleware = bridgedApp.use.args[0][0];
    assume(patchMiddleware).property('name', 'http2Patch');

    // attaches _implicitHeader to the response object
    const req = {};
    const res = {};
    const next = sinon.stub();
    patchMiddleware(req, res, next);

    assume(res).property('_implicitHeader');
    assume(next).is.called();
  });

  it('adds the cookie-parser middleware before plugin middleware', async () => {
    await plugin.hooks.createServers(gasket, {});

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
    await plugin.hooks.createServers(gasket, {});

    const cookieParserUsage = findCall(
      app.use,
      (path, mw) => mw === cookieParserMiddleware);
    assume(cookieParserUsage).to.not.be.null();
  });

  it('adds the compression middleware by default', async () => {
    await plugin.hooks.createServers(gasket, {});

    const compressionUsage = findCall(
      app.use,
      mw => mw === compressionMiddleware);
    assume(compressionUsage).to.not.be.null();
  });

  it('adds the compression middleware when enabled from gasket config', async () => {
    gasket.config.express = { compression: true };
    await plugin.hooks.createServers(gasket, {});

    const compressionUsage = findCall(
      app.use,
      mw => mw === compressionMiddleware);
    assume(compressionUsage).to.not.be.null();
  });

  it('does not add the compression middleware when disabled from gasket config', async () => {
    gasket.config.express = { compression: false };
    await plugin.hooks.createServers(gasket, {});

    const compressionUsage = findCall(
      app.use,
      mw => mw === compressionMiddleware);
    assume(compressionUsage).to.be.null();
  });

  it('adds middleware from lifecycle (ignores falsy)', async () => {
    await plugin.hooks.createServers(gasket, {});
    assume(app.use).called(2);

    sinon.resetHistory();
    lifecycles.middleware.resolves([() => {}, null]);

    await plugin.hooks.createServers(gasket, {});
    assume(app.use).called(3);
  });

  it('adds errorMiddleware from lifecycle (ignores falsy)', async () => {
    await plugin.hooks.createServers(gasket, {});
    assume(app.use).called(2);

    sinon.resetHistory();
    lifecycles.errorMiddleware.resolves([() => {}, null]);

    await plugin.hooks.createServers(gasket, {});
    assume(app.use).called(3);
  });

  function findCall(aSpy, aPredicate) {
    const callIdx = aSpy.args.findIndex(args => aPredicate(...args));
    return callIdx === -1 ? null : aSpy.getCall(callIdx);
  }
});

describe('create', () => {
  let mockContext;

  function assumeCreatedWith(assertFn) {
    return async function assumeCreated() {
      await plugin.hooks.create({}, mockContext);
      assertFn(mockContext);
    };
  }

  beforeEach(() => {
    mockContext = {
      pkg: { add: sinon.spy() },
      files: { add: sinon.spy() }
    };
  });

  it('adds appropriate dependencies', assumeCreatedWith(({ pkg }) => {
    assume(pkg.add).calledWith('dependencies', {
      express: '^4.16.3'
    });
  }));
});
