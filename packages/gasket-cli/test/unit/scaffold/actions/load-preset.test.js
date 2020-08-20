const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');


describe('loadPreset', () => {
  let sandbox, mockContext, mockPkgs, mockImports, loadPreset;
  let cloneStub, mockFetcherSpy, loadPresetStub; // eslint-disable-line no-unused-vars

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockPkgs = {
      '@gasket/preset-bogus@^1.0.0': {
        package: {
          name: '@gasket/preset-bogus',
          version: '1.2.3',
          dependencies: {
            '@gasket/plugin-bogus': '1.2.3',
            'gasket-plugin-user-bogus': '3.2.1',
            '@gasket/preset-some': '1.0.1'
          }
        }
      },
      '@gasket/preset-all-i-ever-wanted@^2.0.0': {
        package: {
          name: '@gasket/preset-all-i-ever-wanted',
          version: '2.0.0',
          dependencies: {
            'gasket-plugin-more-deps': '4.5.6'
          }
        }
      },
      '@gasket/preset-some@1.0.1': {
        package: {
          name: '@gasket/preset-some',
          version: '1.0.1'
        }
      },
      'gasket-preset-local': {
        package: {
          name: 'gasket-preset-local',
          version: '3.0.0',
          dependencies: {
            'gasket-plugin-local': '5.0.0'
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
            const info = module.includes('gasket-preset-local') ? mockPkgs['gasket-preset-local'] : mockPkgs[module];
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
      rawPresets: ['@gasket/preset-bogus@^1.0.0']
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(loadPreset).property('wrapped');
  });

  describe('remote and local packages', () => {
    beforeEach(() => {
      mockContext.localPresets = ['../../../fixtures/gasket-preset-local'];
    });

    it('includes one of each other', async () => {
      await loadPreset(mockContext);
      assume(mockContext.presetInfos).to.lengthOf(2);
      assume(mockContext).to.have.deep.property('rawPresets', ['@gasket/preset-bogus@^1.0.0']);
      assume(mockContext).to.have.deep.property('localPresets', ['../../../fixtures/gasket-preset-local']);
      assume(mockContext.presetInfos[0]).property('rawName');
      assume(mockContext.presetInfos[0].rawName).equals('@gasket/preset-bogus@^1.0.0');
      assume(mockContext.presetInfos[1]).property('rawName');
      assume(mockContext.presetInfos[1].rawName).includes('@file:');
    });

    it('includes multiple of remote and local packages', async () => {
      mockContext.rawPresets = ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0'];
      mockContext.localPresets = ['../../../fixtures/gasket-preset-local', '../../../fixtures/gasket-preset-local'];

      await loadPreset(mockContext);
      assume(mockContext).to.have
        .deep.property('rawPresets', ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0']);
      assume(mockContext).to.have
        .deep.property('localPresets', ['../../../fixtures/gasket-preset-local', '../../../fixtures/gasket-preset-local']);
      assume(mockContext).to.have.deep
        .property('presets', ['@gasket/bogus', '@gasket/all-i-ever-wanted', 'local', 'local']);
      assume(mockContext.presetInfos).to.lengthOf(4);
    });

    it('supports preset extensions', async () => {
      mockContext.rawPresets = ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0'];
      mockContext.localPresets = ['../../../fixtures/gasket-preset-local', '../../../fixtures/gasket-preset-local'];

      await loadPreset(mockContext);
      assume(mockContext).to.have
        .deep.property('rawPresets', ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0']);
      assume(mockContext).to.have.deep
        .property('localPresets', ['../../../fixtures/gasket-preset-local', '../../../fixtures/gasket-preset-local']);
      assume(mockContext).to.have.deep
        .property('presets', ['@gasket/bogus', '@gasket/all-i-ever-wanted', 'local', 'local']);
      assume(mockContext.presetInfos).to.lengthOf(4);
    });
  });

  describe('local package', () => {
    beforeEach(() => {
      mockContext.rawPresets = null;
      mockContext.localPresets = ['../../../fixtures/gasket-preset-local'];
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

    it('adds multiple local packages', async () => {
      mockContext.localPresets = ['../../../fixtures/gasket-preset-local', '../../../fixtures/gasket-preset-local'];

      await loadPreset(mockContext);
      assume(mockContext.presetInfos).to.lengthOf(2);
      assume(mockContext.presetInfos[0]).property('rawName');
      assume(mockContext.presetInfos[0].rawName).includes('@file:');
      assume(mockContext.presetInfos[1]).property('rawName');
      assume(mockContext.presetInfos[1].rawName).includes('@file:');
    });
  });

  describe('remote package', () => {
    it('instantiates Fetcher with full package name', async () => {
      await loadPreset(mockContext);
      assume(mockFetcherSpy).is.called();
      assume(mockFetcherSpy.args[0][0]).property('packageName', '@gasket/preset-bogus@^1.0.0');
    });

    it('fetches the preset', async () => {
      await loadPreset(mockContext);
      assume(cloneStub).is.called();
    });

    it('does not adjust rawPresets from command', async () => {
      assume(mockContext).to.have.deep.property('rawPresets', ['@gasket/preset-bogus@^1.0.0']);
      await loadPreset(mockContext);
      assume(mockContext).to.have.deep.property('rawPresets', ['@gasket/preset-bogus@^1.0.0']);
    });
  });

  it('adds preset short names to context', async () => {
    await loadPreset(mockContext);
    assume(mockContext).to.have.deep.property('presets', ['@gasket/bogus']);
  });

  it('sets preset short name from flags', async () => {
    await loadPreset(mockContext);
    assume(mockContext).to.have.deep.property('presets', ['@gasket/bogus']);
  });

  it('supports multiple presets', async () => {
    mockContext.rawPresets = ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0'];

    await loadPreset(mockContext);
    assume(mockContext).to.have.deep.property('presets', ['@gasket/bogus', '@gasket/all-i-ever-wanted']);
    assume(mockContext.presetInfos).to.lengthOf(2);
  });

  it('adds presetInfos to context', async () => {
    await loadPreset(mockContext);
    assume(mockContext).to.have.deep.property('presetInfos', [{
      ...mockPkgs['@gasket/preset-bogus@^1.0.0'],
      from: 'cli',
      rawName: '@gasket/preset-bogus@^1.0.0',
      presets: [{ package: { name: '@gasket/preset-some', version: '1.0.1' },
        from: '@gasket/preset-bogus', rawName: '@gasket/preset-some@1.0.1' }]
    }]);
  });
});
