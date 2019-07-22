const assumeSinonPlugin = require('assume-sinon');
const assume = require('assume');
assume.use(assumeSinonPlugin);

const proxyquire = require('proxyquire').noCallThru();
const { spy, stub } = require('sinon');
const errs = require('errs');

describe('servers hook', () => {
  let start, createServersModule, debugStub;
  let gasketAPI, handler;

  beforeEach(() => {
    gasketAPI = {
      exec: stub(),
      config: {},
      logger: {
        info: spy()
      }
    };
    handler = stub().yields();

    createServersModule = stub().yields(null);
    debugStub = spy();

    start = proxyquire('../', {
      'create-servers': createServersModule,
      'diagnostics': stub().returns(debugStub)
    }).hooks.start;

    gasketAPI.exec.withArgs('createServers').resolves([handler]);
  });

  it('does not create an HTTP server if `http` is `null`', async () => {
    gasketAPI.config = {
      hostname: 'local.gasket.godaddy.com',
      http: null,
      https: { port: 3000 }
    };

    await executeModule();

    const createServerOpts = createServersModule.lastCall.args[0];
    assume(createServerOpts).to.not.haveOwnProperty('http');
  });

  it('does not create an HTTPS server if `https` is `null`', async () => {
    gasketAPI.config = {
      hostname: 'local.gasket.godaddy.com',
      http: 8080,
      https: null
    };

    await executeModule();

    const createServerOpts = createServersModule.lastCall.args[0];
    assume(createServerOpts).to.not.haveOwnProperty('https');
  });

  describe('success message', () => {
    it('is output when the servers have been started', async () => {
      gasketAPI.config = {
        hostname: 'local.gasket.godaddy.com',
        http: 8080
      };

      await executeModule();

      const logMessages = gasketAPI.logger.info.args.map(([message]) => message);
      assume(logMessages[0]).to.match(/http:\/\/local\.gasket\.godaddy\.com:8080\//);
    });

    it('contains the configured hostname', async () => {
      gasketAPI.config = {
        hostname: 'myapp.godaddy.com',
        https: { port: 8443 }
      };

      await executeModule();

      const logMessages = gasketAPI.logger.info.args.map(([message]) => message);
      assume(logMessages[0]).to.match(/https:\/\/myapp\.godaddy\.com:8443\//);
    });

    it('contains the configured port numbers', async () => {
      gasketAPI.config = {
        hostname: 'local.gasket.godaddy.com',
        https: { port: 3000 }
      };

      await executeModule();

      const logMessages = gasketAPI.logger.info.args.map(([message]) => message);
      assume(logMessages[0]).to.match(/https:\/\/local\.gasket\.godaddy\.com:3000\//);
    });
  });

  it('rejects with an Error on failure', async () => {
    createServersModule.yields(errs.create({ https: { message: 'HTTP server failed to start', errno: 'something' }}));

    await executeModule();

    assume(debugStub.args[0][0].message).equals('failed to start the http/https servers');
    assume(debugStub.args[0][1].https.message).equals('HTTP server failed to start');
  });

  it('rejects with an Error about ports on failure (with http)', async () => {

    createServersModule.yields(errs.create({
      http: {
        errno: 'EADDRINUSE'
      }
    }));

    await executeModule();

    assume(debugStub.args[0][0].message).to.match('Port is already in use');
    assume(debugStub.args[0][1].http.errno).equals('EADDRINUSE');
  });

  it('rejects with an Error about ports on failure (with https)', async () => {

    createServersModule.yields(errs.create({
      https: {
        errno: 'EADDRINUSE'
      }
    }));

    await executeModule();

    assume(debugStub.args[0][0].message).to.match('Port is already in use');
    assume(debugStub.args[0][1].https.errno).equals('EADDRINUSE');
  });

  async function executeModule() {
    return start(gasketAPI);
  }
});
