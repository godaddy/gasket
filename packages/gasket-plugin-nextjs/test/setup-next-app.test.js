const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire').noCallThru();

const { stub } = sinon;

describe('setupNextApp', () => {
  let gasket, next, nextHandler, module;

  const getModule = () => {
    return proxyquire('../lib/setup-next-app', {
      next
    });
  };

  beforeEach(() => {
    nextHandler = {
      prepare: stub().resolves(),
      getRequestHandler: stub().resolves({})
    };

    next = stub().returns(nextHandler);
    module = getModule();
  });

  it('exports setupNextApp instance', function () {
    assume(module).property('setupNextApp');
    assume(module.setupNextApp).to.be.a('asyncfunction');
  });

  it('executes the `next` lifecycle', async function () {
    gasket = mockGasketApi();
    await module.setupNextApp(gasket);
    assume(gasket.exec).has.been.calledWith('next', nextHandler);
  });

  it('does not derive a webpack config if not running a dev server',
    async () => {
      await module.setupNextApp(gasket);
      const nextOptions = next.lastCall.args[0];
      assume(nextOptions.conf).to.not.haveOwnProperty('webpack');
    });

  describe('devServer mode', () => {
    it('creates devServer when gasket command is local', async function () {
      gasket = mockGasketApi();
      gasket.command = 'local';
      await module.setupNextApp(gasket);
      assume(next).to.have.been.calledWith({
        dev: true,
        conf: sinon.match.object,
        host: 'localhost',
        port: 3000
      });
    });

    it('creates devServer when gasket command id is local', async function () {
      gasket = mockGasketApi();
      gasket.command = { id: 'local' };
      await module.setupNextApp(gasket);
      assume(next).to.have.been.calledWith({
        dev: true,
        conf: sinon.match.object,
        host: 'localhost',
        port: 3000
      });
    });

    it('creates default mode nextjs app when gasket command is not local',
      async function () {
        gasket = mockGasketApi();
        await module.setupNextApp(gasket);
        assume(next).to.have.been.calledWith({
          dev: false,
          conf: sinon.match.object,
          host: 'localhost',
          port: 3000
        });
      });

  });
});

function mockGasketApi() {
  return {
    command: {
      id: 'fake'
    },
    execWaterfall: stub().returnsArg(1),
    exec: stub().resolves({}),
    execSync: stub().returns([]),
    logger: {
      warning: stub()
    },
    config: {
      webpack: {}, // user specified webpack config
      nextConfig: {}, // user specified next.js config
      root: '/app/path',
      http: 3000,
      host: 'localhost'
    }
  };
}
