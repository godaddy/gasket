const {
  mockPackageManagerConstructor,
  mockPackageManagerExec,
  mockMkdtemp,
  mockCp,
  mockReaddir,
  mockRm,
  mockPathJoin,
  mockPathResolve,
  mockTmpdir
} = vi.hoisted(() => ({
  mockPackageManagerConstructor: vi.fn(),
  mockPackageManagerExec: vi.fn(),
  mockMkdtemp: vi.fn(),
  mockCp: vi.fn(),
  mockReaddir: vi.fn(),
  mockRm: vi.fn(),
  mockPathJoin: vi.fn().mockImplementation((...args) => args.join('/')),
  mockPathResolve: vi.fn().mockImplementation((...args) => args.join('/').replace(/\/+/g, '/')),
  mockTmpdir: vi.fn()
}));

vi.mock('@gasket/utils', () => ({
  PackageManager: class MockPackageManager {
    constructor(options) {
      mockPackageManagerConstructor(options);
    }
    async exec(...args) {
      return mockPackageManagerExec(...args);
    }
  }
}));

vi.mock('fs/promises', () => ({
  mkdtemp: mockMkdtemp,
  cp: mockCp,
  readdir: mockReaddir,
  rm: mockRm
}));

vi.mock('path', () => ({
  default: {
    join: mockPathJoin,
    resolve: mockPathResolve,
    relative: vi.fn().mockImplementation((from, to) => {
      // Simple relative path calculation for testing
      if (from === '/current/dir' && to.startsWith('/path/to/app/')) {
        return '../' + to.replace('/path/to/app/', '');
      }
      return to.replace(from, '');
    })
  }
}));

vi.mock('os', () => ({
  default: {
    tmpdir: mockTmpdir
  }
}));


// Set up mock defaults
mockTmpdir.mockReturnValue('/tmp');
mockMkdtemp.mockResolvedValue('/tmp/gasket-template-test-123');
mockReaddir.mockResolvedValue([
  { name: 'gasket.js', isDirectory: () => false },
  { name: 'package.json', isDirectory: () => false },
  { name: 'README.md', isDirectory: () => false },
  { name: 'node_modules', isDirectory: () => true }
]);
mockCp.mockResolvedValue();
mockRm.mockResolvedValue();
mockPackageManagerExec.mockResolvedValue();

const loadTemplate = (await import('../../../../lib/scaffold/actions/load-template.js')).default;

describe('loadTemplate', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      appName: 'test-app',
      dest: '/path/to/app',
      cwd: '/current/dir',
      generatedFiles: new Set(),
      messages: []
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('is decorated action', () => {
    expect(loadTemplate).toHaveProperty('wrapped');
  });

  describe('early return conditions', () => {
    it('returns early if no template or templatePath provided', async () => {
      await loadTemplate({ context: mockContext });

      expect(mockMkdtemp).not.toHaveBeenCalled();
      expect(mockPackageManagerConstructor).not.toHaveBeenCalled();
    });

    it('proceeds if template is provided', async () => {
      mockContext.template = '@gasket/template-test';

      await loadTemplate({ context: mockContext });

      expect(mockMkdtemp).toHaveBeenCalled();
      expect(mockPackageManagerConstructor).toHaveBeenCalled();
    });

    it('proceeds if templatePath is provided', async () => {
      mockContext.templatePath = '/path/to/local/template';

      await loadTemplate({ context: mockContext });

      expect(mockCp).toHaveBeenCalled();
    });
  });

  describe('local template path', () => {
    beforeEach(() => {
      mockContext.templatePath = '/path/to/local/template';
    });

    it('uses resolved template path', async () => {
      await loadTemplate({ context: mockContext });

      expect(mockPathResolve).toHaveBeenCalledWith('/path/to/local/template', 'template');
      expect(mockReaddir).toHaveBeenCalledWith(
        '/path/to/local/template/template',
        { withFileTypes: true }
      );
    });

    it('copies all files except node_modules', async () => {
      await loadTemplate({ context: mockContext });

      expect(mockCp).toHaveBeenCalledTimes(3);
      expect(mockCp).toHaveBeenCalledWith(
        '/path/to/local/template/template/gasket.js',
        '/path/to/app/gasket.js',
        { recursive: true }
      );
      expect(mockCp).toHaveBeenCalledWith(
        '/path/to/local/template/template/package.json',
        '/path/to/app/package.json',
        { recursive: true }
      );
      expect(mockCp).toHaveBeenCalledWith(
        '/path/to/local/template/template/README.md',
        '/path/to/app/README.md',
        { recursive: true }
      );
    });

    it('adds generated files to context', async () => {
      await loadTemplate({ context: mockContext });

      expect(mockContext.generatedFiles.has('../gasket.js')).toBe(true);
      expect(mockContext.generatedFiles.has('../package.json')).toBe(true);
      expect(mockContext.generatedFiles.has('../README.md')).toBe(true);
    });

    it('runs npm ci in destination directory', async () => {
      await loadTemplate({ context: mockContext });

      expect(mockPackageManagerConstructor).toHaveBeenCalledWith({
        packageManager: 'npm',
        dest: '/path/to/app'
      });
      expect(mockPackageManagerExec).toHaveBeenCalledWith('ci');
    });

    it('adds success message', async () => {
      await loadTemplate({ context: mockContext });

      expect(mockContext.messages).toContain(
        'Template local template at /path/to/local/template/template installed and dependencies resolved'
      );
    });
  });

  describe('remote template package', () => {
    beforeEach(() => {
      mockContext.template = '@gasket/template-nextjs';
    });

    it('creates temporary directory', async () => {
      await loadTemplate({ context: mockContext });

      expect(mockMkdtemp).toHaveBeenCalledWith('/tmp/gasket-template-test-app');
    });

    it('creates PackageManager for temporary directory', async () => {
      await loadTemplate({ context: mockContext });

      expect(mockPackageManagerConstructor).toHaveBeenCalledWith({
        packageManager: 'npm',
        dest: '/tmp/gasket-template-test-123'
      });
    });

    it('installs template package without version', async () => {
      await loadTemplate({ context: mockContext });

      expect(mockPackageManagerExec).toHaveBeenNthCalledWith(1, 'install', ['@gasket/template-nextjs@latest']);
    });

    it('installs template package with version', async () => {
      mockContext.template = '@gasket/template-nextjs@^1.0.0';

      await loadTemplate({ context: mockContext });

      expect(mockPackageManagerExec).toHaveBeenNthCalledWith(1, 'install', ['@gasket/template-nextjs@^1.0.0']);
    });

    it('installs template package with tag', async () => {
      mockContext.template = '@gasket/template-nextjs@canary';

      await loadTemplate({ context: mockContext });

      expect(mockPackageManagerExec).toHaveBeenNthCalledWith(1, 'install', ['@gasket/template-nextjs@canary']);
    });

    it('handles file: versions', async () => {
      mockContext.template = '@gasket/template-nextjs@file:./local/path';

      await loadTemplate({ context: mockContext });

      expect(mockPackageManagerExec).toHaveBeenNthCalledWith(1, 'install', ['@gasket/template-nextjs@file:./local/path']);
    });

    it('copies template files from node_modules', async () => {
      await loadTemplate({ context: mockContext });

      const templatePath = '/tmp/gasket-template-test-123/node_modules/@gasket/template-nextjs/template';
      expect(mockReaddir).toHaveBeenCalledWith(templatePath, { withFileTypes: true });
      expect(mockCp).toHaveBeenCalledTimes(3);
    });

    it('cleans up temporary directory after successful installation', async () => {
      await loadTemplate({ context: mockContext });

      expect(mockRm).toHaveBeenNthCalledWith(1, '/tmp/gasket-template-test-123', { recursive: true });
    });

    it('runs npm ci in destination directory after copying', async () => {
      await loadTemplate({ context: mockContext });

      // First call is for template installation, second is for app dependencies
      expect(mockPackageManagerExec).toHaveBeenNthCalledWith(2, 'ci');
      expect(mockPackageManagerConstructor).toHaveBeenNthCalledWith(2, {
        packageManager: 'npm',
        dest: '/path/to/app'
      });
    });

    it('adds success message with template name and version', async () => {
      await loadTemplate({ context: mockContext });

      expect(mockContext.messages).toContain('Template @gasket/template-nextjs@latest installed and dependencies resolved');
    });

    describe('error handling for remote templates', () => {
      it('cleans up temporary directory on install error', async () => {
        const error = new Error('Installation failed');
        mockPackageManagerExec.mockRejectedValueOnce(error);

        await expect(loadTemplate({ context: mockContext })).rejects.toThrow(
          'Failed to install template @gasket/template-nextjs@latest: Installation failed'
        );

        expect(mockRm).toHaveBeenCalledWith('/tmp/gasket-template-test-123', { recursive: true });
      });

      it('provides specific error for registry not found', async () => {
        const error = new Error('npm error');
        error.stderr = "'@gasket/template-notfound' is not in this registry.";
        mockPackageManagerExec.mockRejectedValueOnce(error);

        const expectedError = 'Template not found in registry: @gasket/template-nextjs@latest. ' +
          'Use npm_config_registry=<registry> to use privately scoped templates.';
        await expect(loadTemplate({ context: mockContext })).rejects.toThrow(expectedError);
      });

      it('cleans up temporary directory after successful operation', async () => {
        await loadTemplate({ context: mockContext });

        // Verify cleanup was called for the temporary directory
        expect(mockRm).toHaveBeenCalledWith('/tmp/gasket-template-test-123', { recursive: true });
      });

      it('cleans up temporary directory on general error', async () => {
        mockCp.mockRejectedValueOnce(new Error('Copy failed'));

        await expect(loadTemplate({ context: mockContext })).rejects.toThrow('Copy failed');

        expect(mockRm).toHaveBeenCalledWith('/tmp/gasket-template-test-123', { recursive: true });
      });

      it('ignores cleanup errors during error handling', async () => {
        mockCp.mockRejectedValueOnce(new Error('Copy failed'));
        mockRm.mockRejectedValueOnce(new Error('Cleanup failed'));

        await expect(loadTemplate({ context: mockContext })).rejects.toThrow('Copy failed');

        // Should still attempt cleanup even if it fails
        expect(mockRm).toHaveBeenCalledWith('/tmp/gasket-template-test-123', { recursive: true });
      });
    });
  });

  describe('version and tag parsing', () => {
    const testCases = [
      {
        input: '@gasket/template-nextjs@1.0.0',
        expectedName: '@gasket/template-nextjs',
        expectedVersion: '@1.0.0'
      },
      {
        input: '@gasket/template-nextjs@^1.0.0',
        expectedName: '@gasket/template-nextjs',
        expectedVersion: '@^1.0.0'
      },
      {
        input: '@gasket/template-nextjs@~1.2.3',
        expectedName: '@gasket/template-nextjs',
        expectedVersion: '@~1.2.3'
      },
      {
        input: '@gasket/template-nextjs@1.0.0-beta.1',
        expectedName: '@gasket/template-nextjs',
        expectedVersion: '@1.0.0-beta.1'
      },
      {
        input: '@gasket/template-nextjs@canary',
        expectedName: '@gasket/template-nextjs',
        expectedVersion: '@canary'
      },
      {
        input: '@gasket/template-nextjs@file:./local/path',
        expectedName: '@gasket/template-nextjs',
        expectedVersion: '@file:./local/path'
      },
      {
        input: '@gasket/template-nextjs',
        expectedName: '@gasket/template-nextjs',
        expectedVersion: '@latest'
      }
    ];

    testCases.forEach(({ input, expectedName, expectedVersion }) => {
      it(`correctly parses ${input}`, async () => {
        mockContext.template = input;

        await loadTemplate({ context: mockContext });

        expect(mockPackageManagerExec).toHaveBeenNthCalledWith(1, 'install', [`${expectedName}${expectedVersion}`]);
        expect(mockContext.messages).toContain(`Template ${expectedName}${expectedVersion} installed and dependencies resolved`);
      });
    });
  });

  describe('file operations', () => {
    beforeEach(() => {
      mockContext.template = '@gasket/template-test';
    });

    it('filters out node_modules from copying', async () => {
      mockReaddir.mockResolvedValueOnce([
        { name: 'gasket.js', isDirectory: () => false },
        { name: 'node_modules', isDirectory: () => true },
        { name: 'src', isDirectory: () => true },
        { name: 'package.json', isDirectory: () => false }
      ]);

      await loadTemplate({ context: mockContext });

      expect(mockCp).toHaveBeenCalledTimes(3);
      const templateBase = '/tmp/gasket-template-test-123/node_modules/@gasket/template-test/template';
      expect(mockCp).toHaveBeenCalledWith(
        `${templateBase}/gasket.js`,
        '/path/to/app/gasket.js',
        { recursive: true }
      );
      expect(mockCp).toHaveBeenCalledWith(
        `${templateBase}/src`,
        '/path/to/app/src',
        { recursive: true }
      );
      expect(mockCp).toHaveBeenCalledWith(
        `${templateBase}/package.json`,
        '/path/to/app/package.json',
        { recursive: true }
      );
    });

    it('uses recursive copy for all files', async () => {
      await loadTemplate({ context: mockContext });

      expect(mockCp).toHaveBeenCalledWith(expect.any(String), expect.any(String), { recursive: true });
    });

    it('tracks generated files relative to cwd', async () => {
      await loadTemplate({ context: mockContext });

      expect(mockContext.generatedFiles.size).toBe(3);
      expect([...mockContext.generatedFiles]).toEqual(expect.arrayContaining([
        '../gasket.js',
        '../package.json',
        '../README.md'
      ]));
    });
  });
});
