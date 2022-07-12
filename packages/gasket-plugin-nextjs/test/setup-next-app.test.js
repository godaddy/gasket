const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire').noCallThru();
const { setupNextApp } = require('../lib/setup-next-app');

const { spy, stub } = sinon;

describe('setupNextApp', () => {
  let next, nextHandler, module;

  let result, gasket, data, mockConfig, mockCreateConfig, mockCreateApp;

  const getModule = () => {
    return proxyquire('../lib/setup-next-app', {
        // './config': {
        //     createConfig: mockCreateConfig
        // }, 
        // 'next': {
        //     default: mockCreateApp
        // }
    });
  }

  beforeEach(() => {

    nextHandler = {
      prepare: stub().resolves(),
      getRequestHandler: stub().resolves({})
    };
    mockCreateApp = stub().resolves(nextHandler)
    
    // module = proxyquire('../lib/setup-next-app', {
    //     next: mockCreateApp
    // })

    module = getModule()
    // next = stub().returns(nextHandler);

    // plugin = proxyquire('../lib/', { next });
    // hook = plugin.hooks.fastify.handler;
  });

  it('exports setupNextApp instance', function () {
    assume(module).property('setupNextApp');
    console.log(`MODULE : ${module.setupNextApp}`);
    assume(setupNextApp).to.be.a('function');
  });

  it('executes the `next` lifecycle', async function () {
    gasket = mockGasketApi();
    result = setupNextApp(gasket);
    console.log('RESULT ==> ', result);
    assume(gasket.exec).has.been.calledWith('next', nextHandler);
    // assume(result).property('prepare')
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
