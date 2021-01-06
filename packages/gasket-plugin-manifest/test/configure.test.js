const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const baseConfig = require('../lib/base-config');

describe('configure', function () {
  const joinStub = sinon.stub();

  const configure = proxyquire('../lib/configure', {
    path: {
      join: joinStub
    }
  });

  let gasket;

  beforeEach(function () {
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
    const scope = '/custom';
    const config = { manifest: { scope } };

    const results = configure(gasket, config);

    assume(results.manifest).eqls(
      { ...baseConfig, scope }
    );
  });

  it('works with defaults when not configured', function () {
    const config = {};

    const results = configure(gasket, config);

    assume(results.manifest).eqls(baseConfig);
  });

  it('uses default path when staticOutput is true', function () {
    const staticOutput = true;
    const config = { manifest: { staticOutput } };

    configure(gasket, config);

    assume(joinStub.args[0][1]).eqls('public/manifest.json');
  });

  it('uses custom path when passed from manifest', function () {
    const staticOutput = 'custom/path/manifest.json';
    const config = { manifest: { staticOutput } };

    configure(gasket, config);

    assume(joinStub.args[0][1]).eqls(staticOutput);
  });

  it('sets static output to false when not configured', function () {
    configure(gasket, { manifest: {} });
    assume(joinStub.called).false();
  });
});
