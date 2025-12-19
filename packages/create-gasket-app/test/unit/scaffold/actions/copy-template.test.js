const mockReaddir = vi.fn();
const mockCp = vi.fn();
const mockWriteFile = vi.fn();
const mockAccess = vi.fn();

vi.mock('fs/promises', () => ({
  readdir: mockReaddir,
  cp: mockCp,
  writeFile: mockWriteFile,
  access: mockAccess
}));

const copyTemplate = (await import('../../../../lib/scaffold/actions/copy-template.js')).default;

describe('copyTemplate', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      templateDir: '/tmp/node_modules/@gasket/template-test/template',
      dest: '/path/to/test-app',
      cwd: '/path/to',
      generatedFiles: new Set()
    };
    // By default, simulate .gitignore doesn't exist
    mockAccess.mockRejectedValue(new Error('ENOENT'));
    mockWriteFile.mockResolvedValue();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('is decorated action', () => {
    expect(copyTemplate).toHaveProperty('wrapped');
  });

  it('does nothing if templateDir is not set', async () => {
    mockContext.templateDir = null;

    await copyTemplate({ context: mockContext });

    expect(mockReaddir).not.toHaveBeenCalled();
    expect(mockCp).not.toHaveBeenCalled();
  });

  it('copies template files excluding node_modules', async () => {
    const mockEntries = [
      { name: 'package.json', isFile: () => true, isDirectory: () => false },
      { name: 'src', isFile: () => false, isDirectory: () => true },
      { name: 'README.md', isFile: () => true, isDirectory: () => false },
      { name: 'node_modules', isFile: () => false, isDirectory: () => true }
    ];

    mockReaddir.mockResolvedValue(mockEntries);
    mockCp.mockResolvedValue();

    await copyTemplate({ context: mockContext });

    expect(mockReaddir).toHaveBeenCalledWith(mockContext.templateDir, { withFileTypes: true });

    // Should copy all files except node_modules
    expect(mockCp).toHaveBeenCalledTimes(3);
    expect(mockCp).toHaveBeenCalledWith(
      '/tmp/node_modules/@gasket/template-test/template/package.json',
      '/path/to/test-app/package.json',
      { recursive: true }
    );
    expect(mockCp).toHaveBeenCalledWith(
      '/tmp/node_modules/@gasket/template-test/template/src',
      '/path/to/test-app/src',
      { recursive: true }
    );
    expect(mockCp).toHaveBeenCalledWith(
      '/tmp/node_modules/@gasket/template-test/template/README.md',
      '/path/to/test-app/README.md',
      { recursive: true }
    );

    // Should not copy node_modules
    expect(mockCp).not.toHaveBeenCalledWith(
      expect.stringContaining('node_modules'),
      expect.stringContaining('node_modules'),
      expect.any(Object)
    );
  });

  it('tracks generated files in context', async () => {
    const mockEntries = [
      { name: 'package.json', isFile: () => true, isDirectory: () => false },
      { name: 'src', isFile: () => false, isDirectory: () => true }
    ];

    mockReaddir.mockResolvedValue(mockEntries);
    mockCp.mockResolvedValue();

    await copyTemplate({ context: mockContext });

    expect(mockContext.generatedFiles.has('test-app/package.json')).toBe(true);
    expect(mockContext.generatedFiles.has('test-app/src')).toBe(true);
    expect(mockContext.generatedFiles.has('test-app/.gitignore')).toBe(true);
    expect(mockContext.generatedFiles.size).toBe(3);
  });

  it('handles empty template directory', async () => {
    mockReaddir.mockResolvedValue([]);

    await copyTemplate({ context: mockContext });

    expect(mockCp).not.toHaveBeenCalled();
    // Should still create .gitignore
    expect(mockWriteFile).toHaveBeenCalledWith(
      '/path/to/test-app/.gitignore',
      expect.stringContaining('node_modules'),
      'utf8'
    );
    expect(mockContext.generatedFiles.has('test-app/.gitignore')).toBe(true);
    expect(mockContext.generatedFiles.size).toBe(1);
  });

  it('handles copy errors', async () => {
    const mockEntries = [
      { name: 'package.json', isFile: () => true, isDirectory: () => false }
    ];

    mockReaddir.mockResolvedValue(mockEntries);
    mockCp.mockRejectedValue(new Error('Permission denied'));

    await expect(copyTemplate({ context: mockContext }))
      .rejects.toThrow('Permission denied');
  });

  it('handles readdir errors', async () => {
    mockReaddir.mockRejectedValue(new Error('Directory not found'));

    await expect(copyTemplate({ context: mockContext }))
      .rejects.toThrow('Directory not found');
  });

  it('copies nested directory structure', async () => {
    mockContext.templateDir = '/templates/complex';
    mockContext.dest = '/apps/my-app';

    const mockEntries = [
      { name: 'pages', isFile: () => false, isDirectory: () => true },
      { name: 'styles', isFile: () => false, isDirectory: () => true },
      { name: 'public', isFile: () => false, isDirectory: () => true }
    ];

    mockReaddir.mockResolvedValue(mockEntries);
    mockCp.mockResolvedValue();

    await copyTemplate({ context: mockContext });

    expect(mockCp).toHaveBeenCalledWith(
      '/templates/complex/pages',
      '/apps/my-app/pages',
      { recursive: true }
    );
    expect(mockCp).toHaveBeenCalledWith(
      '/templates/complex/styles',
      '/apps/my-app/styles',
      { recursive: true }
    );
    expect(mockCp).toHaveBeenCalledWith(
      '/templates/complex/public',
      '/apps/my-app/public',
      { recursive: true }
    );
  });

  describe('ensureGitignore', () => {
    it('creates .gitignore if it does not exist', async () => {
      const mockEntries = [
        { name: 'package.json', isFile: () => true, isDirectory: () => false }
      ];

      mockReaddir.mockResolvedValue(mockEntries);
      mockCp.mockResolvedValue();
      mockAccess.mockRejectedValue(new Error('ENOENT'));

      await copyTemplate({ context: mockContext });

      expect(mockAccess).toHaveBeenCalledWith('/path/to/test-app/.gitignore');
      expect(mockWriteFile).toHaveBeenCalledWith(
        '/path/to/test-app/.gitignore',
        expect.stringContaining('node_modules'),
        'utf8'
      );
      expect(mockContext.generatedFiles.has('test-app/.gitignore')).toBe(true);
    });

    it('does not create .gitignore if it already exists', async () => {
      const mockEntries = [
        { name: 'package.json', isFile: () => true, isDirectory: () => false }
      ];

      mockReaddir.mockResolvedValue(mockEntries);
      mockCp.mockResolvedValue();
      mockAccess.mockResolvedValue(); // Simulate .gitignore exists

      await copyTemplate({ context: mockContext });

      expect(mockAccess).toHaveBeenCalledWith('/path/to/test-app/.gitignore');
      expect(mockWriteFile).not.toHaveBeenCalled();
      expect(mockContext.generatedFiles.has('test-app/.gitignore')).toBe(false);
    });

    it('adds .gitignore to generatedFiles when created', async () => {
      const mockEntries = [
        { name: 'src', isFile: () => false, isDirectory: () => true }
      ];

      mockReaddir.mockResolvedValue(mockEntries);
      mockCp.mockResolvedValue();
      mockAccess.mockRejectedValue(new Error('ENOENT'));

      await copyTemplate({ context: mockContext });

      expect(mockContext.generatedFiles.has('test-app/src')).toBe(true);
      expect(mockContext.generatedFiles.has('test-app/.gitignore')).toBe(true);
      expect(mockContext.generatedFiles.size).toBe(2);
    });
  });
});
