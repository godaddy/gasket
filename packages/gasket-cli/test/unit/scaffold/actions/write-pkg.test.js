const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');
const path = require('path');
const ConfigBuilder = require('../../../../src/scaffold/config-builder');

describe('write-pkg', () => {
  let sandbox, mockContext, writePkg;
  let writeStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockContext = {
      cwd: '/some/path',
      dest: '/some/path/my-app',
      pkg: ConfigBuilder.createPackageJson({
        name: 'my-app',
        version: '0.0.0'
      }),
      generatedFiles: new Set()
    };

    writeStub = sandbox.stub();

    writePkg = proxyquire('../../../../src/scaffold/actions/write-pkg', {
      'util': { promisify: () => writeStub },
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(writePkg).property('wrapped');
  });

  it('writes the package.json file under destination', async () => {
    writeStub.resolves();
    await writePkg(mockContext);
    assume(writeStub).is.calledWith(path.join(mockContext.dest, 'package.json'));
  });

  it('writes pretty JSON from pkg', async () => {
    writeStub.resolves();
    await writePkg(mockContext);
    const expected = JSON.stringify(mockContext.pkg, null, 2);
    assume(writeStub.args[0][1]).eqls(expected);
  });
});
