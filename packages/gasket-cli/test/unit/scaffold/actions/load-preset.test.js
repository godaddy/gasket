const path = require('path');
const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');


describe('loadPreset', () => {
  let sandbox, mockContext, mockPkgs, mockImports, loadPreset;
  let readPackageStub, mockFetcherSpy; // eslint-disable-line no-unused-vars

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockPkgs = {
      '@gasket/bogus-preset@^1.0.0': {
        name: 'bogus',
        version: '1.2.3',
        dependencies: {
          '@gasket/bogus-plugin': '1.2.3',
          'user-bogus-plugin': '3.2.1'
        }
      },
      '@gasket/all-i-ever-wanted-preset@^2.0.0': {
        name: 'all-i-ever-wanted',
        version: '2.0.0',
        dependencies: {
          'more-deps-plugin': '4.5.6'
        }
      }
    };

    readPackageStub = sandbox.stub();

    mockImports = {
      '../fetcher': class MockFetcher {
        constructor(options) {
          this.packageName = options.packageName;
        }

        readPackage() {
          return readPackageStub.resolves(mockPkgs[this.packageName])(...arguments);
        }
      },
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    mockFetcherSpy = sandbox.spy(mockImports, '../fetcher');

    loadPreset = proxyquire('../../../../src/scaffold/actions/load-preset', mockImports);

    mockContext = {
      cwd: __dirname,
      rawPresets: ['@gasket/bogus-preset@^1.0.0']
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(loadPreset).property('wrapped');
  });

  describe('local package', () => {
    beforeEach(() => {
      mockContext.rawPresets = null;
      mockContext.presetPath = '../../../fixtures/local-preset';
    });

    it('does not instantiates Fetcher ', async () => {
      await loadPreset(mockContext);
      assume(mockFetcherSpy).not.is.called();
    });

    it('sets rawPresets', async () => {
      assume(mockContext.rawPresets).equals(null);
      await loadPreset(mockContext);
      assume(mockContext.rawPresets).not.equals(null);
    });

    it('gets preset name from local package', async () => {
      await loadPreset(mockContext);
      assume(mockContext.rawPresets[0]).contains('@gasket/test-preset');
    });

    it('sets preset version to file path', async () => {
      await loadPreset(mockContext);
      const expectedPath = path.resolve(__dirname, '../../../fixtures/local-preset');
      assume(mockContext.rawPresets).to.be.an('array');
      assume(mockContext.rawPresets[0]).contains(`file:${expectedPath}`);
    });
  });

  describe('remote package', () => {
    it('instantiates Fetcher with full package name', async () => {
      await loadPreset(mockContext);
      assume(mockFetcherSpy).is.called();
      assume(mockFetcherSpy.args[0][0]).property('packageName', '@gasket/bogus-preset@^1.0.0');
    });

    it('fetches the preset', async () => {
      await loadPreset(mockContext);
      assume(readPackageStub).is.called();
    });

    it('does not adjust rawPresets from command', async () => {
      assume(mockContext).to.have.deep.property('rawPresets', ['@gasket/bogus-preset@^1.0.0']);
      await loadPreset(mockContext);
      assume(mockContext).to.have.deep.property('rawPresets', ['@gasket/bogus-preset@^1.0.0']);
    });
  });

  it('sets preset short name from flags', async () => {
    await loadPreset(mockContext);
    assume(mockContext).to.have.deep.property('presets', ['bogus']);
  });

  it('supports multiple presets', async () => {
    mockContext.rawPresets = ['@gasket/bogus-preset@^1.0.0', '@gasket/all-i-ever-wanted-preset@^2.0.0'];

    await loadPreset(mockContext);
    assume(mockContext).to.have.deep.property('presets', ['bogus', 'all-i-ever-wanted']);
    assume(mockContext.presetPlugins).to.eql(['bogus', 'user-bogus-plugin', 'more-deps-plugin']);
  });

  it('adds presetPackage to context', async () => {
    await loadPreset(mockContext);
    assume(mockContext).to.have.deep.property('presetPkgs', [mockPkgs['@gasket/bogus-preset@^1.0.0']]);
  });

  it('adds presetPlugins to context with shortNames', async () => {
    await loadPreset(mockContext);
    assume(mockContext.presetPlugins).to.eql(['bogus', 'user-bogus-plugin']);
  });
});
