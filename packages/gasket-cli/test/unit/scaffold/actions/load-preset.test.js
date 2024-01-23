const mockCloneStub = jest.fn();
const mockConstructorStub = jest.fn();
const mockLoadPresetStub = jest.fn();
let mockPkgs = {
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

jest.mock('../../../../src/scaffold/fetcher', () => class MockFetcher {
  constructor(options) {
    mockConstructorStub(...arguments);
    this.packageName = options.packageName;
  }

  clone() {
    mockCloneStub();
    return this.packageName;
  }
});
jest.mock('@gasket/resolve', () => ({
  ...jest.requireActual('@gasket/resolve'),
  Loader: class MockLoader {
    loadPreset(module, meta) {
      mockLoadPresetStub(...arguments);
      const info = module.includes('gasket-preset-local') ? mockPkgs['gasket-preset-local'] : mockPkgs[module];
      return { ...info, ...meta };
    }
  }
}));

const loadPreset = require('../../../../src/scaffold/actions/load-preset');

describe('loadPreset', () => {
  let mockContext;

  beforeEach(() => {

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

    mockContext = {
      cwd: __dirname,
      rawPresets: ['@gasket/preset-bogus@^1.0.0'],
      errors: []
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is decorated action', async () => {
    expect(loadPreset).toHaveProperty('wrapped');
  });

  describe('remote and local packages', () => {
    beforeEach(() => {
      mockContext.localPresets = ['../../../fixtures/gasket-preset-local'];
    });

    it('includes one of each other', async () => {
      await loadPreset(mockContext);
      expect(mockContext.presetInfos).toHaveLength(2);
      expect(mockContext).toHaveProperty('rawPresets', ['@gasket/preset-bogus@^1.0.0']);
      expect(mockContext).toHaveProperty('localPresets', ['../../../fixtures/gasket-preset-local']);
      expect(mockContext.presetInfos[0]).toHaveProperty('rawName');
      expect(mockContext.presetInfos[0].rawName).toEqual('@gasket/preset-bogus@^1.0.0');
      expect(mockContext.presetInfos[1]).toHaveProperty('rawName');
      expect(mockContext.presetInfos[1].rawName).toContain('@file:');
    });

    it('includes multiple of remote and local packages', async () => {
      mockContext.rawPresets = ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0'];
      mockContext.localPresets = ['../../../fixtures/gasket-preset-local', '../../../fixtures/gasket-preset-local'];

      await loadPreset(mockContext);
      expect(mockContext).toHaveProperty('rawPresets', ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0']);
      expect(mockContext).toHaveProperty('localPresets', ['../../../fixtures/gasket-preset-local', '../../../fixtures/gasket-preset-local']);
      expect(mockContext)
        .toHaveProperty('presets', ['@gasket/bogus', '@gasket/all-i-ever-wanted', 'local', 'local']);
      expect(mockContext.presetInfos).toHaveLength(4);
    });

    it('supports preset extensions', async () => {
      mockContext.rawPresets = ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0'];
      mockContext.localPresets = ['../../../fixtures/gasket-preset-local', '../../../fixtures/gasket-preset-local'];

      await loadPreset(mockContext);
      expect(mockContext).toHaveProperty('rawPresets', ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0']);
      expect(mockContext)
        .toHaveProperty('localPresets', ['../../../fixtures/gasket-preset-local', '../../../fixtures/gasket-preset-local']);
      expect(mockContext)
        .toHaveProperty('presets', ['@gasket/bogus', '@gasket/all-i-ever-wanted', 'local', 'local']);
      expect(mockContext.presetInfos).toHaveLength(4);
    });
  });

  describe('local package', () => {
    beforeEach(() => {
      mockContext.rawPresets = null;
      mockContext.localPresets = ['../../../fixtures/gasket-preset-local'];
    });

    it('does not instantiates Fetcher', async () => {
      await loadPreset(mockContext);
      expect(mockConstructorStub).not.toHaveBeenCalled();
    });

    it('adds rawName with file: path to presetInfo', async () => {
      await loadPreset(mockContext);
      expect(mockContext.presetInfos[0]).toHaveProperty('rawName');
      expect(mockContext.presetInfos[0].rawName).toContain('@file:');
    });

    it('adds multiple local packages', async () => {
      mockContext.localPresets = ['../../../fixtures/gasket-preset-local', '../../../fixtures/gasket-preset-local'];

      await loadPreset(mockContext);
      expect(mockContext.presetInfos).toHaveLength(2);
      expect(mockContext.presetInfos[0]).toHaveProperty('rawName');
      expect(mockContext.presetInfos[0].rawName).toContain('@file:');
      expect(mockContext.presetInfos[1]).toHaveProperty('rawName');
      expect(mockContext.presetInfos[1].rawName).toContain('@file:');
    });
  });

  describe('remote package', () => {
    it('instantiates Fetcher with full package name', async () => {
      await loadPreset(mockContext);
      expect(mockConstructorStub).toHaveBeenCalled();
      expect(mockConstructorStub.mock.calls[0][0]).toHaveProperty('packageName', '@gasket/preset-bogus@^1.0.0');
    });

    it('fetches the preset', async () => {
      await loadPreset(mockContext);
      expect(mockCloneStub).toHaveBeenCalled();
    });

    it('does not adjust rawPresets from command', async () => {
      expect(mockContext).toHaveProperty('rawPresets', ['@gasket/preset-bogus@^1.0.0']);
      await loadPreset(mockContext);
      expect(mockContext).toHaveProperty('rawPresets', ['@gasket/preset-bogus@^1.0.0']);
    });
  });

  it('adds preset short names to context', async () => {
    await loadPreset(mockContext);
    expect(mockContext).toHaveProperty('presets', ['@gasket/bogus']);
  });

  it('sets preset short name from flags', async () => {
    await loadPreset(mockContext);
    expect(mockContext).toHaveProperty('presets', ['@gasket/bogus']);
  });

  it('supports multiple presets', async () => {
    mockContext.rawPresets = ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0'];

    await loadPreset(mockContext);
    expect(mockContext).toHaveProperty('presets', ['@gasket/bogus', '@gasket/all-i-ever-wanted']);
    expect(mockContext.presetInfos).toHaveLength(2);
  });

  it('adds presetInfos to context', async () => {
    await loadPreset(mockContext);
    expect(mockContext).toHaveProperty('presetInfos', [{
      ...mockPkgs['@gasket/preset-bogus@^1.0.0'],
      from: 'cli',
      rawName: '@gasket/preset-bogus@^1.0.0',
      presets: [{
        package: { name: '@gasket/preset-some', version: '1.0.1' },
        from: '@gasket/preset-bogus', rawName: '@gasket/preset-some@1.0.1'
      }]
    }]);
  });
});
