const assumeSinonPlugin = require('assume-sinon');
const assume = require('assume');
assume.use(assumeSinonPlugin);

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const errs = require('errs');

const createServersModule = sinon.stub().yields(null, []);
const HealthCheckError = sinon.spy();
const createTerminus = sinon.spy();
const debugStub = sinon.spy();

const plugin = proxyquire('../', {
  'create-servers': createServersModule,
  'diagnostics': sinon.stub().returns(debugStub),
  '@godaddy/terminus': {
    createTerminus,
    HealthCheckError
  }
});

describe('Plugin', () => {
  it('is an object', () => {
    assume(plugin).is.an('object');
  });

  it('has expected name', () => {
    assume(plugin).to.have.property('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'start',
      'metadata'
    ];

    assume(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
  });
});

describe('create hook', () => {
  let mockContext, pkgAddStub;

  async function create() {
    return plugin.hooks.create({}, mockContext);
  }

  beforeEach(() => {
    pkgAddStub = sinon.stub();

    mockContext = {
      gasketConfig: {
        add: pkgAddStub
      }
    };
  });

  it('is an async function', function () {
    assume(create).to.be.an('asyncfunction');
  });

  it('adds the expected http port for local development', async function () {
    await create();
    assume(pkgAddStub).calledWithMatch('environments', {
      local: {
        http: 8080
      }
    });
  });
});

describe('start hook', () => {
  let gasketAPI, handler;

  async function start() {
    return plugin.hooks.start(gasketAPI);
  }

  beforeEach(() => {
    sinon.resetHistory();
    gasketAPI = {
      execWaterfall: sinon.stub().callsFake((arg1, arg2) => Promise.resolve(arg2)),
      exec: sinon.stub(),
      config: {},
      logger: {
        info: sinon.spy(),
        error: sinon.spy()
      }
    };
    handler = sinon.stub().yields();
    createServersModule.yields(null, []);

    gasketAPI.exec.withArgs('createServers').resolves([handler]);
  });

  it('does not create an HTTP server if `http` is `null`', async () => {
    gasketAPI.config = {
      hostname: 'local.gasket.godaddy.com',
      http: null,
      https: { port: 3000 }
    };

    await start();

    const createServerOpts = createServersModule.lastCall.args[0];
    assume(createServerOpts).to.not.haveOwnProperty('http');
    assume(createServerOpts).to.haveOwnProperty('https');
  });

  it('does not create an HTTPS server if `https` is `null`', async () => {
    gasketAPI.config = {
      hostname: 'local.gasket.godaddy.com',
      http: 8080,
      https: null
    };

    await start();

    const createServerOpts = createServersModule.lastCall.args[0];
    assume(createServerOpts).to.haveOwnProperty('http');
    assume(createServerOpts).to.not.haveOwnProperty('https');
  });

  it('defaults HTTP server to port 80 if neither `http` or `https`', async () => {
    gasketAPI.config = {};

    await start();

    const createServerOpts = createServersModule.lastCall.args[0];
    assume(createServerOpts).property('http', 80);
    assume(createServerOpts).not.property('https');
  });

  describe('success message', () => {
    beforeEach(() => {
      gasketAPI.execWaterfall.callsFake(() => Promise.resolve(gasketAPI.config));
    });

    it('is output when the servers have been started', async () => {
      gasketAPI.config = {
        hostname: 'local.gasket.godaddy.com',
        http: 8080
      };

      await start();

      const logMessages = gasketAPI.logger.info.args.map(([message]) => message);
      assume(logMessages[0]).to.match(/http:\/\/local\.gasket\.godaddy\.com:8080\//);
    });

    it('contains the configured hostname', async () => {
      gasketAPI.config = {
        hostname: 'myapp.godaddy.com',
        https: { port: 8443 }
      };

      await start();

      const logMessages = gasketAPI.logger.info.args.map(([message]) => message);
      assume(logMessages[0]).to.match(/https:\/\/myapp\.godaddy\.com:8443\//);
    });

    it('contains the configured port numbers', async () => {
      gasketAPI.config = {
        hostname: 'local.gasket.godaddy.com',
        https: { port: 3000 }
      };

      await start();

      const logMessages = gasketAPI.logger.info.args.map(([message]) => message);
      assume(logMessages[0]).to.match(/https:\/\/local\.gasket\.godaddy\.com:3000\//);
    });

    it('uses config from createServers lifecycle', async () => {
      gasketAPI.config = {
        hostname: 'local.gasket.godaddy.com',
        http: 3000
      };

      gasketAPI.execWaterfall.callsFake(() => Promise.resolve({ hostname: 'bogus.com', http: 9000 }));

      await start();

      const logMessages = gasketAPI.logger.info.args.map(([message]) => message);
      assume(logMessages[0]).to.match(/http:\/\/bogus\.com:9000\//);
    });
  });

  it('rejects with an Error on failure', async () => {
    createServersModule.yields(errs.create({ https: { message: 'HTTP server failed to start', errno: 'something' } }));

    await start();

    const expected = 'failed to start the http/https servers';
    assume(gasketAPI.logger.error).calledWith(expected);
    assume(debugStub.args[0][0].message).equals(expected);
    assume(debugStub.args[0][1].https.message).equals('HTTP server failed to start');
  });

  it('rejects with an Error about ports on failure (with http)', async () => {
    createServersModule.yields(errs.create({
      http: {
        errno: 'EADDRINUSE'
      }
    }));

    await start();

    const expected = 'Port is already in use';
    assume(gasketAPI.logger.error).calledWithMatch(expected);
    assume(debugStub.args[0][0].message).to.match(expected);
    assume(debugStub.args[0][1].http.errno).equals('EADDRINUSE');
  });

  it('rejects with an Error about ports on failure (with https)', async () => {
    createServersModule.yields(errs.create({
      https: {
        errno: 'EADDRINUSE'
      }
    }));

    await start();

    assume(debugStub.args[0][0].message).to.match('Port is already in use');
    assume(debugStub.args[0][1].https.errno).equals('EADDRINUSE');
  });

  describe('terminus', function () {
    const aServer = {};
    const servers = { http: aServer };

    beforeEach(function () {
      createServersModule.yields(null, servers);
    });

    it('passes each created server to terminus', async () => {
      await start();

      assume(createTerminus).called(1);
      assume(createTerminus.args[0][0]).equals(aServer);
    });

    it('supports multiple servers as object', async () => {
      createServersModule.yields(null, { https: aServer, http: aServer });

      await start();
      assume(createTerminus).called(2);
      assume(createTerminus.args[0][0]).equals(aServer);
    });

    it('supports multiple servers under object properties', async () => {
      createServersModule.yields(null, { https: [aServer, aServer], http: [aServer, aServer] });

      await start();
      assume(createTerminus).called(4);
      assume(createTerminus.args[0][0]).equals(aServer);
    });

    it('calls terminus with the options', async () => {
      await start();

      const config = createTerminus.args[0][1];

      assume(config.signals).includes('SIGTERM');
      assume(config.logger).is.a('function');
      assume(config.onSignal).is.a('asyncfunction');
      assume(config.onSendFailureDuringShutdown).is.a('asyncfunction');
      assume(config.beforeShutdown).is.a('asyncfunction');
      assume(config.onShutdown).is.a('asyncfunction');

      assume(config.healthChecks).has.property('/healthcheck');
      assume(config.healthChecks['/healthcheck']).is.a('asyncfunction');
    });

    ['onSendFailureDuringShutdown', 'beforeShutdown', 'onSignal', 'onShutdown'].forEach((type) => {
      it(`calls the ${type} lifecycle`, async () => {
        await start();
        const lifecycle = createTerminus.args[0][1][type];
        await lifecycle();

        assume(gasketAPI.exec.args[gasketAPI.exec.args.length - 1][0]).equals(type);
      });
    });

    it('calls the healthcheck lifecycle', async () => {
      await start();
      const lifecycle = createTerminus.args[0][1].healthChecks['/healthcheck'];
      await lifecycle();

      assume(gasketAPI.exec.args[gasketAPI.exec.args.length - 1][0]).equals('healthcheck');
      assume(gasketAPI.exec.args[gasketAPI.exec.args.length - 1][1]).equals(HealthCheckError);
    });
  });
});
