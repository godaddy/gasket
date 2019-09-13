const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');


describe('loadPreset', () => {
  let sandbox, mockContext, mockPkgs, mockImports, loadPreset;
  let cloneStub, mockFetcherSpy, loadPresetStub; // eslint-disable-line no-unused-vars

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockPkgs = {
      '@gasket/bogus-preset@^1.0.0': {
        package: {
          name: 'bogus',
          version: '1.2.3',
          dependencies: {
            '@gasket/bogus-plugin': '1.2.3',
            'user-bogus-plugin': '3.2.1'
          }
        }
      },
      '@gasket/all-i-ever-wanted-preset@^2.0.0': {
        package: {
          name: 'all-i-ever-wanted',
          version: '2.0.0',
          dependencies: {
            'more-deps-plugin': '4.5.6'
          }
        }
      },
      'local-preset': {
        package: {
          name: 'local-preset',
          version: '3.0.0',
          dependencies: {
            'local-plugin': '5.0.0'
          }
        }
      }
    };

    cloneStub = sandbox.stub();
    loadPresetStub = sandbox.stub();

    mockImports = {
      '../fetcher': class MockFetcher {
        constructor(options) {
          this.packageName = options.packageName;
        }

        clone() {
          cloneStub();
          return this.packageName;
        }
      },
      '@gasket/resolve': {
        Loader: class MockLoader {
          loadPreset(module, meta) {
            loadPresetStub(...arguments);
            const info = module.includes('local-preset') ? mockPkgs['local-preset'] : mockPkgs[module];
            return { ...info, ...meta } ;
          }
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

    it('adds rawName with file: path to presetInfo', async () => {
      await loadPreset(mockContext);
      assume(mockContext.presetInfos[0]).property('rawName');
      assume(mockContext.presetInfos[0].rawName).includes('@file:');
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
      assume(cloneStub).is.called();
    });

    it('does not adjust rawPresets from command', async () => {
      assume(mockContext).to.have.deep.property('rawPresets', ['@gasket/bogus-preset@^1.0.0']);
      await loadPreset(mockContext);
      assume(mockContext).to.have.deep.property('rawPresets', ['@gasket/bogus-preset@^1.0.0']);
    });
  });

  it('adds preset short names to context', async () => {
    await loadPreset(mockContext);
    assume(mockContext).to.have.deep.property('presets', ['bogus']);
  });

  it('sets preset short name from flags', async () => {
    await loadPreset(mockContext);
    assume(mockContext).to.have.deep.property('presets', ['bogus']);
  });

  it('supports multiple presets', async () => {
    mockContext.rawPresets = ['@gasket/bogus-preset@^1.0.0', '@gasket/all-i-ever-wanted-preset@^2.0.0'];

    await loadPreset(mockContext);
    assume(mockContext).to.have.deep.property('presets', ['bogus', 'all-i-ever-wanted']);
    assume(mockContext.presetInfos).to.lengthOf(2);
  });

  it('adds presetInfos to context', async () => {
    await loadPreset(mockContext);
    assume(mockContext).to.have.deep.property('presetInfos', [{
      ...mockPkgs['@gasket/bogus-preset@^1.0.0'],
      from: 'cli',
      rawName: '@gasket/bogus-preset@^1.0.0'
    }]);
  });
});
