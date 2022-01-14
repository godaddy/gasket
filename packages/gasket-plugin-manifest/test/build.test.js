const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('build', function () {
  const writeFileStub = sinon.stub();
  const mkdirpStub = sinon.stub();

  const build = proxyquire('../lib/build', {
    'fs/promises': {
      writeFile: writeFileStub
    },
    'mkdirp': mkdirpStub,
    'replace': sinon.stub()
  });

  let gasket;

  beforeEach(function () {
    gasket = {
      execWaterfall: sinon.stub().resolves([]),
      config: {
        root: 'test',
        manifest: {
          staticOutput: '/custom/manifest.json'
        }
      },
      logger: {
        debug: sinon.stub(),
        error: sinon.stub(),
        log: sinon.stub()
      }
    };
  });

  afterEach(function () {
    sinon.reset();
  });

  it('is a function', function () {
    assume(build).is.a('asyncfunction');
    assume(build).has.length(1);
  });

  it('skips logic when staticOutput config is not set', async function () {
    gasket.config.manifest = {};
    await build(gasket);

    assume(mkdirpStub.called).false();
  });

  it('creates custom output directory', async function () {
    gasket.config.manifest.staticOutput = '/super/cool/custom/path/manifest.json';
    await build(gasket);
    assume(mkdirpStub.calledOnce).true();
    assume(mkdirpStub.args[0][0]).eqls('/super/cool/custom/path/');
  });

  it('writes manifest to specified path', async function () {
    await build(gasket);
    assume(writeFileStub.calledOnce).true();
    assume(writeFileStub.args[0]).eqls(['/custom/manifest.json', '[]', 'utf-8']);
  });

  it('logs completion message', async function () {
    await build(gasket);
    assume(gasket.logger.log.calledOnce).true();
    assume(gasket.logger.log.args[0][0]).includes('custom/manifest.json).');
  });
});
