import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const mockConstructorStub = jest.fn();
const mockExecStub = jest.fn();
const mockMkTemp = jest.fn();
const mockCreateRequire = jest.fn();

jest.mock('@gasket/utils', () => {
  return {
    PackageManager: class MockPackageManager {
      constructor({ packageManager, dest }) {
        this.packageManager = packageManager;
        this.dest = dest;
        this.isYarn = packageManager === 'yarn';
        mockConstructorStub(...arguments);
      }
      async exec() {
        mockExecStub(...arguments);
      }
    }
  };
});

jest.unstable_mockModule('fs/promises', () => {
  return {
    mkdtemp: mockMkTemp.mockResolvedValue('/tmp/gasket-create-my-app')
  };
});

jest.unstable_mockModule('module', () => ({
  createRequire: jest.fn(() => mockCreateRequire.mockReturnValue({
    name: '@gasket/test-preset',
    version: '1.2.3',
    dependencies: {
      'bogus-plugin': '^4.5.6'
    }
  }
  ))
}));

const presetBogus = { name: '@gasket/bogus', hooks: {} };
const presetAllIEverWanted = { name: '@gasket/all-i-ever-wanted', hooks: {} };
const presetSome = { name: '@gasket/some', hooks: {} };
const presetLocal = { name: '@gasket/test-preset', hooks: {} };
jest.unstable_mockModule('@gasket/preset-bogus', () => (presetBogus));
jest.unstable_mockModule('@gasket/preset-all-i-ever-wanted', () => (presetAllIEverWanted));
jest.unstable_mockModule('@gasket/preset-some', () => (presetSome));
jest.unstable_mockModule('@gasket/test-preset', () => (presetLocal));

const loadPreset = (await import('../../../../lib/scaffold/actions/load-preset')).default;

describe('loadPreset', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      cwd: __dirname,
      rawPresets: ['@gasket/preset-bogus@^1.0.0'],
      localPresets: [],
      errors: [],
      packageManager: 'npm'
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
      mockContext.localPresets = ['../../../fixtures/local-preset'];
    });

    it('instantiates PackageManager with package name', async () => {
      await loadPreset(null, mockContext);
      expect(mockConstructorStub).toHaveBeenCalled();
      expect(mockConstructorStub.mock.calls[0][0]).toHaveProperty('packageManager', 'npm');
      expect(mockConstructorStub.mock.calls[0][0]).toHaveProperty('dest', '/tmp/gasket-create-my-app');
    });

    it('determines the correct pkg manager verb', async () => {
      mockContext.packageManager = 'yarn';
      await loadPreset(null, mockContext);
      expect(mockExecStub).toHaveBeenCalled();
      expect(mockExecStub.mock.calls[0][0]).toEqual('add');
    });

    it('includes one of each other', async () => {
      await loadPreset(null, mockContext);
      expect(mockContext).toHaveProperty('rawPresets', ['@gasket/preset-bogus@^1.0.0']);
      expect(mockContext).toHaveProperty('localPresets', ['../../../fixtures/local-preset']);
      expect(mockContext.presets).toHaveLength(2);
    });

    it('includes multiple of remote and local packages', async () => {
      mockContext.rawPresets = ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0'];
      mockContext.localPresets = ['../../../fixtures/local-preset', '../../../fixtures/local-preset'];

      await loadPreset(null, mockContext);
      expect(mockContext)
        .toHaveProperty('rawPresets', ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0']);
      expect(mockContext)
        .toHaveProperty('localPresets', ['../../../fixtures/local-preset', '../../../fixtures/local-preset']);
      expect(mockContext.presets).toEqual([
        expect.objectContaining(presetBogus),
        expect.objectContaining(presetAllIEverWanted),
        expect.objectContaining(presetLocal),
        expect.objectContaining(presetLocal)
      ]);
      expect(mockContext.presets).toHaveLength(4);
    });

    it('supports preset extensions', async () => {
      mockContext.rawPresets = ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0'];
      mockContext.localPresets = ['../../../fixtures/gasket-preset-local', '../../../fixtures/gasket-preset-local'];

      await loadPreset(null, mockContext);
      expect(mockContext)
        .toHaveProperty('rawPresets', ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0']);
      expect(mockContext)
        .toHaveProperty('localPresets', ['../../../fixtures/gasket-preset-local', '../../../fixtures/gasket-preset-local']);
      expect(mockContext.presets).toEqual([
        expect.objectContaining(presetBogus),
        expect.objectContaining(presetAllIEverWanted),
        expect.objectContaining(presetLocal),
        expect.objectContaining(presetLocal)
      ]);
      expect(mockContext.presets).toHaveLength(4);
    });
  });

  describe('local package', () => {

    beforeEach(() => {
      mockContext.rawPresets = [];
      mockContext.localPresets = ['../../../fixtures/gasket-preset-local'];
    });


    it('adds multiple local packages', async () => {
      mockContext.localPresets = ['../../../fixtures/gasket-preset-local', '../../../fixtures/gasket-preset-local'];

      await loadPreset(null, mockContext);
      expect(mockContext.presets).toHaveLength(2);
      expect(mockContext.presets).toEqual([
        expect.objectContaining(presetLocal),
        expect.objectContaining(presetLocal)
      ]);
    });
  });

  describe('remote package', () => {

    it('fetches the preset', async () => {
      await loadPreset(null, mockContext);
      expect(mockExecStub).toHaveBeenCalled();
    });

    it('does not adjust rawPresets from command', async () => {
      expect(mockContext).toHaveProperty('rawPresets', ['@gasket/preset-bogus@^1.0.0']);
      await loadPreset(null, mockContext);
      expect(mockContext).toHaveProperty('rawPresets', ['@gasket/preset-bogus@^1.0.0']);
    });
  });


  it('supports multiple presets', async () => {
    mockContext.rawPresets = ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0'];

    await loadPreset(null, mockContext);
    expect(mockContext).toHaveProperty('presets', [
      expect.objectContaining(presetBogus),
      expect.objectContaining(presetAllIEverWanted)
    ]);
    expect(mockContext.presets).toHaveLength(2);
  });
});
