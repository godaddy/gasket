const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('build', function () {
  const writeFileStub = sinon.stub();
  const mkdirpStub = sinon.stub();

  const build = proxyquire('../lib/build', {
    fs: {
      writeFile: writeFileStub
    },
    mkdirp: mkdirpStub,
    util: {
      promisify: f => f
    }
  });

  let gasket;

  beforeEach(() => {
    gasket = {
      execWaterfall: sinon.stub().resolves([]),
      config: {
        root: 'test',
        manifest: {
          staticOutput: true
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

  it('creates default output directory', async function () {
    await build(gasket);
    assume(mkdirpStub.calledOnce).true();
    assume(mkdirpStub.args[0][0]).eqls('/public/manifest.json');
  });

  it('creates custom output directory', async function () {
    gasket.config.manifest.staticOutput = '/super/cool/custom/path/manifest.json';
    await build(gasket);
    assume(mkdirpStub.calledOnce).true();
    assume(mkdirpStub.args[0][0]).eqls('/super/cool/custom/path/manifest.json');
  });

  it('writes manifest to specified path', async function () {
    await build(gasket);
    assume(writeFileStub.calledOnce).true();
    assume(writeFileStub.args[0]).eqls(['/public/manifest.json', '[]', 'utf-8']);
  });

  it('logs completion message', async function () {
    await build(gasket);
    assume(gasket.logger.log.calledOnce).true();
    assume(gasket.logger.log.args[0][0]).includes('/public/manifest.json).');
  });
});
