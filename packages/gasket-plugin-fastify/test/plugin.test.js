const proxyquire = require('proxyquire');
const sinon = require('sinon');
const assume = require('assume');
const middie = require('middie');
const version = require('../package.json').peerDependencies.fastify;

const app = {
  ready: sinon.spy(),
  server: {
    emit: sinon.spy()
  },
  register: sinon.spy(),
  use: sinon.spy()
};
const fastify = sinon.stub().returns(app);

const cookieParserMiddleware = sinon.spy();
const cookieParser = sinon.stub().returns(cookieParserMiddleware);

const compressionMiddleware = sinon.spy();
const compression = sinon.stub().returns(compressionMiddleware);

const plugin = proxyquire('../lib/index', {
  fastify,
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
  let gasket, lifecycles, mockMwPlugins;
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sinon.resetHistory();
    mockMwPlugins =  [];

    lifecycles = {
      middleware: sinon.stub().resolves([]),
      errorMiddleware: sinon.stub().resolves([]),
      fastify: sinon.stub().resolves()
    };

    gasket = {
      middleware: {},
      logger: {},
      config: {},
      exec: sinon.stub().callsFake((lifecycle, ...args) => lifecycles[lifecycle](args)),
      execApply: sandbox.spy(async function (lifecycle, fn) {
        for (let i = 0; i <  mockMwPlugins.length; i++) {
          // eslint-disable-next-line  no-loop-func
          fn(mockMwPlugins[i], () => mockMwPlugins[i]);
        }
        return sinon.stub();
      })
    };
  });

  it('returns the handler app', async function () {
    const result = await plugin.hooks.createServers(gasket, {});
    assume(result.handler).to.be.an('asyncfunction');

    const request = { mock: 'request' };
    await result.handler(request);

    assume(app.ready).to.have.been.called();
    assume(app.server.emit).has.been.calledWith('request', request);
  });

  it('adds log plugin as logger to fastify', async function () {
    await plugin.hooks.createServers(gasket, {});

    assume(fastify).has.been.calledWith({ logger: gasket.logger });
  });

  it('executes the `middleware` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    assume(gasket.execApply).has.been.calledWith('middleware');
  });

  it('executes the `fastify` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    assume(gasket.exec).has.been.calledWith('fastify', app);
  });

  it('executes the `errorMiddleware` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    assume(gasket.exec).has.been.calledWith('errorMiddleware');
  });

  it('executes the `middleware` lifecycle before the `fastify` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    assume(gasket.execApply.firstCall).has.been.calledWith('middleware');
    assume(gasket.exec.firstCall).has.been.calledWith('fastify', app);
  });

  it('executes the `errorMiddleware` lifecycle after the `fastify` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    assume(gasket.exec.firstCall).has.been.calledWith('fastify', app);
    assume(gasket.exec.secondCall).has.been.calledWith('errorMiddleware');
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

  it('registers the middie middleware plugin', async () => {
    await plugin.hooks.createServers(gasket, {});

    assume(app.register).to.have.been.calledWith(middie);
  });

  it('adds middleware to attach res.locals', async () => {
    await plugin.hooks.createServers(gasket, {});

    const middleware = app.use.args[0][0];
    assume(middleware.name).eqls('attachLocals');

    const res = {};
    const next = sinon.stub();
    middleware({}, res, next);

    assume(res).property('locals');
    assume(res.locals).eqls({});
    assume(next).called();
  });

  it('adds the cookie-parser middleware before plugin middleware', async () => {
    await plugin.hooks.createServers(gasket, {});

    const cookieParserUsage = findCall(
      app.use,
      (mw) => mw === cookieParserMiddleware);
    assume(cookieParserUsage).to.not.be.null();

    const withEvent = event => calledEvent => calledEvent === event;
    const middlewareInjection = findCall(gasket.execApply, withEvent('middleware'));
    const routeInjection = findCall(gasket.exec, withEvent('fastify'));

    // callId can be used to determine relative call ordering
    assume(cookieParserUsage.callId).to.be.lessThan(middlewareInjection.callId);
    assume(cookieParserUsage.callId).to.be.lessThan(routeInjection.callId);
  });

  it('adds the cookie-parser middleware with a excluded path', async () => {
    gasket.config.fastify = { excludedRoutesRegex: /^(?!\/_next\/)/ };
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
    gasket.config.fastify = { compression: true };
    await plugin.hooks.createServers(gasket, {});

    const compressionUsage = findCall(
      app.use,
      mw => mw === compressionMiddleware);
    assume(compressionUsage).to.not.be.null();
  });

  it('does not add the compression middleware when disabled from gasket config', async () => {
    gasket.config.fastify = { compression: false };
    await plugin.hooks.createServers(gasket, {});

    const compressionUsage = findCall(
      app.use,
      mw => mw === compressionMiddleware);
    assume(compressionUsage).to.be.null();
  });

  it('adds middleware from lifecycle (ignores falsy)', async () => {
    await plugin.hooks.createServers(gasket, {});
    assume(app.use).called(3);

    sinon.resetHistory();
    mockMwPlugins = [
      { name: 'middlware-1' },
      null
    ];

    await plugin.hooks.createServers(gasket, {});
    assume(app.use).called(4);
  });

  it('middleware paths in the config are used', async () => {
    const paths = ['/home'];
    gasket.config.middleware = [{
      plugin: 'middlware-1',
      paths
    }];
    mockMwPlugins = [
      { name: 'middlware-1' }
    ];
    await plugin.hooks.createServers(gasket, {});
    assume(app.use.lastCall).has.been.calledWith(paths);
  });

  it('adds errorMiddleware from lifecycle (ignores falsy)', async () => {
    await plugin.hooks.createServers(gasket, {});
    assume(app.use).called(3);

    sinon.resetHistory();
    lifecycles.errorMiddleware.resolves([() => {}, null]);

    await plugin.hooks.createServers(gasket, {});
    assume(app.use).called(4);
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
      fastify: version
    });
  }));
});
