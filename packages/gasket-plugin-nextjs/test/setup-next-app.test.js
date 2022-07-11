const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire').noCallThru();
const { setupNextApp } = require('../lib/setup-next-app');

const { spy, stub } = sinon;

describe('setupNextApp', () => {
  let next, nextHandler;

  let result, gasket, data;
  beforeEach(() => {
    gasket = mockGasketApi();
    // fastifyApp = {
    //     decorate: spy(),
    //     register: spy(),
    //     all: spy()
    // };
    // nextHandler = {
    //   prepare: stub().resolves(),
    //   getRequestHandler: stub().resolves({})
    // };
    // next = stub().returns(nextHandler);

    // plugin = proxyquire('../lib/', { next });
    // hook = plugin.hooks.fastify.handler;
  });

  it('executes the `next` lifecycle', async function () {
    result = await setupNextApp(gasket);
    console.log('RESULT ==> ', result);
    assume(gasket.exec).has.been.calledWith('next', nextHandler);
  });

  // it('does not derive a webpack config if not running a dev server', async () => {
  //   await hook(mockGasketApi(), expressApp, false);

  //   const nextOptions = next.lastCall.args[0];
  //   assume(nextOptions.conf).to.not.haveOwnProperty('webpack');
  // });
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
      root: '/app/path'
    }
  };
}
