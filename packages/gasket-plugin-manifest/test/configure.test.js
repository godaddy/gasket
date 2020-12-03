const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const baseConfig = require('../lib/base-config');

describe('configure', function () {
  const deepmergeStub = sinon.stub();
  const joinStub = sinon.stub();

  const configure = proxyquire('../lib/configure', {
    deepmerge: deepmergeStub,
    path: {
      join: joinStub
    }
  });

  let gasket;

  beforeEach(() => {
    gasket = {
      execWaterfall: sinon.stub().resolves([]),
      config: {
        manifest: {
          name: 'Walter White',
          superpower: 'Chemistry'
        },
        serviceWorker: {
          url: 'sw.js'
        },
        root: 'test/'
      },
      logger: {
        debug: sinon.stub()
      }
    };
  });

  afterEach(function () {
    sinon.reset();
  });

  it('is a function', function () {
    assume(configure).is.a('function');
    assume(configure).has.length(1);
  });

  it('merges base config with the manifest config', function () {
    const staticOutput = true;
    const config = { manifest: { staticOutput } };

    deepmergeStub.returns({ ...baseConfig, ...staticOutput });
    configure(gasket, config);

    assume(deepmergeStub.calledOnce).true();
    assume(deepmergeStub.args[0][0]).eqls(
      baseConfig,
      { staticOutput }
    );
  });

  it('sets static output to false when not configured', function () {
    deepmergeStub.returns(baseConfig);
    configure(gasket, { manifest: {} });
    assume(joinStub.called).false();
  });
});
