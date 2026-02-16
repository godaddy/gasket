import { fileURLToPath } from 'url';
import nodePath from 'path';

const {
  mockConstructorStub,
  mockExecStub,
  mockMkTemp,
  mockReadFile,
  mockWriteFile,
  mockPathJoin,
  mockPathResolve
} = vi.hoisted(() => ({
  mockConstructorStub: vi.fn(),
  mockExecStub: vi.fn(),
  mockMkTemp: vi.fn(),
  mockReadFile: vi.fn(),
  mockWriteFile: vi.fn(),
  mockPathJoin: vi.fn().mockImplementation((...args) => {
    const p = args.join('/');
    return p.replace('/node_modules', '');
  }),
  mockPathResolve: vi.fn()
}));

vi.mock('@gasket/utils', () => {
  return {
    PackageManager: class MockPackageManager {
      constructor({ packageManager, dest }) {
        this.manager = packageManager;
        this.dest = dest;
        mockConstructorStub(...arguments);
      }
      async exec() {
        mockExecStub(...arguments);
      }
    }
  };
});

vi.mock('fs/promises', () => {
  return {
    mkdtemp: mockMkTemp,
    readFile: mockReadFile,
    writeFile: mockWriteFile
  };
});

vi.mock('path', () => ({
  default: {
    join: mockPathJoin,
    resolve: mockPathResolve,
    dirname: (path) => path.split('/').slice(0, -1).join('/')
  }
}));

const fileName = fileURLToPath(new URL('.', import.meta.url));

// Set up the mock implementations after imports
mockPathResolve.mockImplementation((...args) => {
  // Simple path resolution without using nodePath.resolve to avoid recursion
  return args.join('/').replace(/\/+/g, '/');
});

// Set up mockMkTemp to return the actual mock directory
mockMkTemp.mockResolvedValue(nodePath.join(fileName, '..', '..', '..', '__mocks__'));

const presetDefaults = { default: { name: '@gasket/preset-default-export', hooks: {} } };
const presetDoubleDefaults = {
  default: {
    default: {
      name: '@gasket/preset-double-default-export',
      hooks: {}
    }
  }
};
const presetNpmExports = { name: '@gasket/preset-npm-exports', hooks: {} };
const presetBogus = { name: '@gasket/preset-bogus', hooks: {} };
const presetAllIEverWanted = { name: '@gasket/preset-all-i-ever-wanted', hooks: {} };
const presetSome = { name: '@gasket/preset-some', hooks: {} };
const presetLocal = { name: '@gasket/test-preset', hooks: {} };
vi.mock('@gasket/preset-default-exports', () => (presetDefaults));
vi.mock('@gasket/preset-double-default-exports', () => (presetDoubleDefaults));
vi.mock('@gasket/preset-npm-exports', () => (presetNpmExports));
vi.mock('@gasket/preset-bogus', () => (presetBogus));
vi.mock('@gasket/preset-all-i-ever-wanted', () => (presetAllIEverWanted));
vi.mock('@gasket/preset-some', () => (presetSome));
vi.mock('gasket-preset-local', () => (presetLocal));
// Note: @gasket/preset-bogus-not-found error is handled via mockExecStub, not vi.mock

const loadPreset = (await import('../../../../lib/scaffold/actions/load-preset.js')).default;

describe('loadPreset', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      cwd: fileName,
      rawPresets: ['@gasket/preset-bogus@^1.0.0'],
      localPresets: [],
      errors: [],
      packageManager: 'npm'
    };

    mockExecStub.mockResolvedValue();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('is decorated action', async () => {
    expect(loadPreset).toHaveProperty('wrapped');
  });

  describe('remote and local packages', () => {
    beforeEach(() => {
      mockContext.localPresets = [`${fileName}../../../__mocks__/gasket-preset-local`];
    });

    it('instantiates PackageManager with package name', async () => {
      await loadPreset({ context: mockContext });
      expect(mockConstructorStub).toHaveBeenCalled();
      expect(mockConstructorStub.mock.calls[0][0]).toHaveProperty('packageManager', 'npm');
      expect(mockConstructorStub.mock.calls[0][0]).toHaveProperty('dest', `${nodePath.join(fileName, '..', '..', '..', '__mocks__')}`);
    });

    it('determines the correct pkg manager verb', async () => {
      mockContext.packageManager = 'yarn';
      await loadPreset({ context: mockContext });
      expect(mockExecStub).toHaveBeenCalled();
      expect(mockExecStub.mock.calls[0][0]).toEqual('add');
    });

    it('includes one of each other', async () => {
      await loadPreset({ context: mockContext });
      expect(mockContext).toHaveProperty('rawPresets', [
        '@gasket/preset-bogus@^1.0.0'
      ]);
      expect(mockContext).toHaveProperty('localPresets', [
        `${fileName}../../../__mocks__/gasket-preset-local`
      ]);
      expect(mockContext.presets).toHaveLength(2);
    });

    it('includes multiple of remote and local packages', async () => {
      mockContext.rawPresets = ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^2.0.0'];
      mockContext.localPresets = [
        `${fileName}../../../__mocks__/gasket-preset-local`,
        `${fileName}../../../__mocks__/gasket-preset-local`
      ];

      await loadPreset({ context: mockContext });
      expect(mockContext)
        .toHaveProperty('rawPresets', [
          '@gasket/preset-bogus@^1.0.0',
          '@gasket/preset-all-i-ever-wanted@^2.0.0'
        ]);
      expect(mockContext)
        .toHaveProperty('localPresets', [
          `${fileName}../../../__mocks__/gasket-preset-local`,
          `${fileName}../../../__mocks__/gasket-preset-local`
        ]);
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
      mockContext.localPresets = [
        `${fileName}../../../__mocks__/gasket-preset-local`,
        `${fileName}../../../__mocks__/gasket-preset-local`
      ];

      await loadPreset({ context: mockContext });
      expect(mockContext)
        .toHaveProperty('rawPresets', [
          '@gasket/preset-bogus@^1.0.0',
          '@gasket/preset-all-i-ever-wanted@^2.0.0'
        ]);
      expect(mockContext)
        .toHaveProperty('localPresets', [
          `${fileName}../../../__mocks__/gasket-preset-local`,
          `${fileName}../../../__mocks__/gasket-preset-local`
        ]);
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
      mockContext.localPresets = [`${fileName}../../../__mocks__/gasket-preset-local`];
    });


    it('adds multiple local packages', async () => {
      mockContext.localPresets = [
        `${fileName}../../../__mocks__/gasket-preset-local`,
        `${fileName}../../../__mocks__/gasket-preset-local`
      ];

      await loadPreset({ context: mockContext });
      expect(mockContext.presets).toHaveLength(2);
      expect(mockContext.presets).toEqual([
        expect.objectContaining(presetLocal),
        expect.objectContaining(presetLocal)
      ]);
    });

    it('throws error if local preset fails to install', async () => {
      mockContext.rawPresets = [`${fileName}../../../__mocks__/gasket-preset-local-bogus`];

      await expect(async () => {
        await loadPreset({ context: mockContext });
      }).rejects.toThrow(
        `Failed to install preset ${fileName}../../../__mocks__/gasket-preset-local-bogus@latest`
      );
    });
  });

  describe('remote package', () => {

    it('fetches the preset', async () => {
      await loadPreset({ context: mockContext });
      expect(mockExecStub).toHaveBeenCalled();
    });

    it('does not adjust rawPresets from command', async () => {
      expect(mockContext).toHaveProperty('rawPresets', ['@gasket/preset-bogus@^1.0.0']);
      await loadPreset({ context: mockContext });
      expect(mockContext).toHaveProperty('rawPresets', ['@gasket/preset-bogus@^1.0.0']);
    });

    it('throws error if remote preset fails to install', async () => {
      mockContext.rawPresets = ['@gasket/preset-bogus-bogus@^1.0.0'];

      await expect(async () => {
        await loadPreset({ context: mockContext });
      }).rejects.toThrow('Failed to install preset @gasket/preset-bogus-bogus@^1.0.0');
    });
  });


  it('supports multiple presets', async () => {
    mockContext.rawPresets = ['@gasket/preset-bogus@^1.0.0', '@gasket/preset-all-i-ever-wanted@^1.0.0'];

    await loadPreset({ context: mockContext });
    expect(mockContext).toHaveProperty('presets', [
      expect.objectContaining(presetBogus),
      expect.objectContaining(presetAllIEverWanted)
    ]);
    expect(mockContext.presets).toHaveLength(2);
  });

  it('supports preset with tags', async () => {
    mockContext.rawPresets = ['@gasket/preset-bogus@canary', '@gasket/preset-all-i-ever-wanted@next'];

    await loadPreset({ context: mockContext });
    expect(mockContext).toHaveProperty('presets', [
      expect.objectContaining(presetBogus),
      expect.objectContaining(presetAllIEverWanted)
    ]);
    expect(mockContext.presets).toHaveLength(2);
  });

  it('supports preset default exports', async () => {
    mockContext.rawPresets = [
      // common with ESM presets
      '@gasket/preset-default-exports',
      // happens with TS -> CJS transpile presets
      '@gasket/preset-double-default-exports'
    ];

    await loadPreset({ context: mockContext });
    expect(mockContext).toHaveProperty('presets', [
      expect.objectContaining(presetDefaults.default),
      expect.objectContaining(presetDoubleDefaults.default)
    ]);
    expect(mockContext.presets).toHaveLength(2);
  });

  it('supports preset with file version', async () => {
    const filePath = nodePath.resolve(fileName, '..', '..', '..', '__mocks__', '@gasket', 'preset-bogus');

    mockContext.rawPresets = [
      `@gasket/preset-bogus@file:${filePath}`
    ];

    await loadPreset({ context: mockContext });
    expect(mockContext).toHaveProperty('presets', [
      expect.objectContaining(presetBogus)
    ]);
    expect(mockContext.presets).toHaveLength(1);
  });

  it('supports preset with npm exports', async () => {
    mockContext.rawPresets = ['@gasket/preset-npm-exports'];

    await loadPreset({ context: mockContext });
    expect(mockContext).toHaveProperty('presets', [
      expect.objectContaining(presetNpmExports)
    ]);
  });

  it('throws error if preset name is short name', async () => {
    mockContext.rawPresets = ['@gasket/bogus'];

    await expect(async () => {
      await loadPreset({ context: mockContext });
    }).rejects.toThrow('Invalid preset short name: @gasket/bogus. Presets must be a full name.');
  });

  it('throws error if preset name is mispelled', async () => {
    mockContext.rawPresets = ['@gasket/bogus-preset'];

    await expect(async () => {
      await loadPreset({ context: mockContext });
    }).rejects.toThrow('Invalid preset name: @gasket/bogus-preset. Please check the name and try again.');
  });

  it('throws error if preset is not found in registry', async () => {
    mockContext.rawPresets = ['@gasket/preset-bogus-not-found'];

    // Configure mock to throw error for this specific preset
    mockExecStub.mockImplementation((verb, packages) => {
      if (packages[0] === '@gasket/preset-bogus-not-found@latest') {
        const err = new Error('some npm error');
        err.stderr = "'@gasket/preset-bogus-not-found' is not in this registry.";
        err.code = 404;
        throw err;
      }
      return Promise.resolve();
    });

    await expect(async () => {
      await loadPreset({ context: mockContext });
    }).rejects.toThrow('Preset not found in registry: @gasket/preset-bogus-not-found@latest. Use npm_config_registry=<registry> to use privately scoped presets.');
  });

  it('uses path.resolve for proper path construction in pathToFileURL', async () => {
    mockContext.rawPresets = ['@gasket/preset-bogus@^1.0.0'];

    await loadPreset({ context: mockContext });

    // Verify path.resolve was called for constructing paths
    expect(mockPathResolve).toHaveBeenCalled();
    const resolveCall = mockPathResolve.mock.calls[0];
    expect(resolveCall).toHaveLength(3); // modPath, name, entryPath
    expect(resolveCall[1]).toBe('@gasket/preset-bogus'); // package name
    expect(resolveCall[2]).toBe('index.js'); // entry path from package.json
  });
});
