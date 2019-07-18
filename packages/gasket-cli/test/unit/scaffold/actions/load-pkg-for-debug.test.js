const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');
const path = require('path');
const ConfigBuilder = require('../../../../src/scaffold/config-builder');

describe('load-pkg-for-debug', () => {
  let sandbox, mockContext, mockImports, loadPkg, mockPkg;
  let readFileStub, packageJsonSpy;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockPkg = {
      name: 'my-app',
      description: 'my cool app',
      dependencies: {
        '@gasket/default-preset': '^1.0.0'
      }
    };

    readFileStub = sandbox.stub().resolves(JSON.stringify(mockPkg));

    mockImports = {
      'util': { promisify: () => readFileStub },
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    packageJsonSpy = sandbox.spy(ConfigBuilder, 'createPackageJson');

    loadPkg = proxyquire('../../../../src/scaffold/actions/load-pkg-for-debug', mockImports);

    mockContext = {
      cwd: '/some/path',
      dest: '/some/path/my-app'
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(loadPkg).property('wrapped');
  });

  it('loads the package.json file under destination', async () => {
    await loadPkg(mockContext);
    const expected = path.join(mockContext.dest, 'package.json');
    assume(readFileStub).is.calledWith(expected);
  });

  it('instantiates a new ConfigBuilder', async () => {
    await loadPkg(mockContext);
    assume(packageJsonSpy).is.called();
  });

  it('adds the fields from loaded file to pkg', async () => {
    await loadPkg(mockContext);
    const expected = mockPkg;
    assume(packageJsonSpy).calledWith(expected);
  });

  it('assigns pkg to context', async () => {
    await loadPkg(mockContext);
    assume(mockContext).property('pkg');
    assume(mockContext.pkg).instanceOf(ConfigBuilder);
  });
});
