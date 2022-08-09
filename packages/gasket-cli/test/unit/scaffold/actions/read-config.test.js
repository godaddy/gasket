const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');

const runners = { npm: 'npx', yarn: 'yarn' };

describe('readConfig', () => {
  let sandbox, mockContext, mockImports, readConfig;
  let getTestPlugin, getPackageManager;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      plugins: []
    };

    mockImports = {
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    readConfig = proxyquire('../../../../src/scaffold/actions/read-config', mockImports);

    [getPackageManager, getTestPlugin] = readConfig.loaders;

  });


  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(readConfig).property('wrapped');
  });

  describe('packageManager', () => {
    ['npm', 'yarn'].forEach((manager) => {
      it(`[${manager}] does not override packageManager if packageManager set in context`, async () => {
        mockContext.packageManager = manager;
        await getPackageManager(mockContext, { packageManager: 'fake' });
        assume(mockContext.packageManager).to.be.equal(manager);
      });

      it(`[${manager}] sets packageManager in context from config`, async () => {
        await getPackageManager(mockContext, { packageManager: manager });
        assume(mockContext.packageManager).to.be.equal(manager);
      });

      it(`[${manager}] sets package manager commands in context`, async () => {
        await getPackageManager(mockContext, { packageManager: manager });
        assume(mockContext).property('installCmd', `${manager} install`);
        assume(mockContext).property('localCmd', `${runners[manager]} gasket local`);
      });

      it(`[${manager}] sets package manager commands in context even when packageManager is already set in context`, async () => {
        mockContext.packageManager = manager;
        await getPackageManager(mockContext);
        assume(mockContext).property('installCmd', `${manager} install`);
        assume(mockContext).property('localCmd', `${runners[manager]} gasket local`);
      });
    });

  });

  describe('testPlugin', () => {
    it('assigns testPlugin set in context', async () => {
      mockContext.testPlugin = 'bogus';
      await getTestPlugin(mockContext, {});
      assume(mockContext).property('testPlugin', 'bogus');

    });

    it('sets the testPlugin if a known test plugin included by preset', async () => {
      mockContext.presetInfos = [{
        plugins: [
          { name: '@gasket/jest' }
        ]
      }];
      await getTestPlugin(mockContext, { testPlugin: 'bogus-plugin' });

      assume(mockContext).property('testPlugin', '@gasket/jest');
    });

    it('does not set unrecognized testPlugin from context', async () => {
      await getTestPlugin(mockContext, { testPlugin: 'bogus-plugin' });
      assume(mockContext).not.property('testPlugin');
    });

    it('prompts if a known test plugin not included in context plugins', async () => {
      mockContext.plugins = ['gasket-plugin-unknown-test'];
      await getTestPlugin(mockContext, { testSuite: 'mocha' });
      assume(mockContext).property('testPlugin', '@gasket/mocha');
    });
  });

  describe('readConfig', () => {
    it('sets context from config object', async () => {
      const mockCiConfig = {
        description: 'A basic gasket app',
        package: 'npm',
        testSuite: 'mocha'
      };
      await readConfig.wrapped(mockContext, mockCiConfig);
    
      assume(mockContext).property('testPlugin', '@gasket/mocha');
      assume(mockContext).property('description', mockCiConfig.description);
      assume(mockContext).property('packageManager', 'npm');
    });
  });

});
