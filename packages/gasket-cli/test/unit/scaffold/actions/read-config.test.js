const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');

describe('readConfig', () => {
  let sandbox, mockContext, mockImports, readConfig;
  let getTestPlugin, getPackageManager;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      plugins: [],
      extant: false
    };

    promptStub = sandbox.stub().returns({});

    mockImports = {
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    readConfig = proxyquire('../../../../src/scaffold/actions/read-config', mockImports);

    [ getTestPlugin, getPackageManager ] = readConfig.loaders

  });


  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(readConfig).property('wrapped');
  });
});