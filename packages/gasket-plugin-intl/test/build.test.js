const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const buildManifest = sinon.stub().resolves();
const buildModules = sinon.stub().resolves();

describe('build', function () {
  let mockGasket, plugin, buildHook;

  beforeEach(function () {
    mockGasket = {
      config: {
        intl: {}
      }
    };

    plugin = proxyquire('../lib/index', {
      './build-manifest': buildManifest,
      './build-modules': buildModules
    });

    buildHook = plugin.hooks.build;
  });

  afterEach(function () {
    sinon.restore();
  });

  it('has expected timing', function () {
    assume(buildHook).property('timing');
    assume(buildHook.timing).property('first', true);
  });

  it('builds manifest file', async function () {
    await buildHook.handler(mockGasket);
    assume(buildModules).not.called();
    assume(buildManifest).calledWith(mockGasket);
  });

  it('builds modules if set in config', async function () {
    mockGasket.config.intl.modules = {};
    await buildHook.handler(mockGasket);
    assume(buildModules).calledWith(mockGasket);
    assume(buildManifest).calledWith(mockGasket);
  });
});
