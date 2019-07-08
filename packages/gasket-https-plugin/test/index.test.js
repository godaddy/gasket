const assume = require('assume');
const proxyquire = require('proxyquire').noCallThru();
const { spy, stub } = require('sinon');
const errs = require('errs');

describe('servers hook', () => {
  let createServers, createServersModule;
  let gasketAPI, handler;

  beforeEach(() => {
    gasketAPI = {
      exec: spy(),
      config: {},
      logger: {
        info: spy()
      }
    };
    handler = stub().yields();

    createServersModule = stub().yields(null);

    createServers = proxyquire('../', {
      'create-servers': createServersModule
    }).hooks.http;
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

    let threw = false;
    try {
      await executeModule();
    } catch (err) {
      threw = true;
      assume(err).to.be.instanceOf(Error);
      assume(err.message).to.match(/failed to start the http\/https servers/);
    } finally {
      assume(threw).equals(true);
    }
  });

  it('rejects with an Error about ports on failure (with http)', async () => {

    createServersModule.yields(errs.create({
      http: {
        errno: 'EADDRINUSE'
      }
    }));

    let threw = false;
    try {
      await executeModule();
    } catch (err) {
      threw = true;
      assume(err).to.be.instanceOf(Error);
      assume(err.message).to.match(/Port is already in use/);

    } finally {
      assume(threw).equals(true);
    }
  });

  it('rejects with an Error about ports on failure (with https)', async () => {

    createServersModule.yields(errs.create({
      https: {
        errno: 'EADDRINUSE'
      }
    }));

    let threw = false;
    try {
      await executeModule();
    } catch (err) {
      threw = true;
      assume(err).to.be.instanceOf(Error);
      assume(err.message).to.match(/Port is already in use/);

    } finally {
      assume(threw).equals(true);
    }
  });

  async function executeModule() {
    return createServers(gasketAPI, handler);
  }
});
