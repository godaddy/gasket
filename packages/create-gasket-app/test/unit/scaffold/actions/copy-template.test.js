const mockReaddir = vi.fn();
const mockCp = vi.fn();
const mockRename = vi.fn();

vi.mock('fs/promises', () => ({
  readdir: mockReaddir,
  cp: mockCp,
  rename: mockRename
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
    mockCp.mockResolvedValue();
    mockRename.mockResolvedValue();
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

    // First call for templateDir, second for dest (processTemplateFiles)
    mockReaddir
      .mockResolvedValueOnce(mockEntries)
      .mockResolvedValueOnce([]);

    await copyTemplate({ context: mockContext });

    expect(mockReaddir).toHaveBeenCalledWith(mockContext.templateDir, { withFileTypes: true });

    // Should copy all files except node_modules
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

    mockReaddir
      .mockResolvedValueOnce(mockEntries)
      .mockResolvedValueOnce([]);

    await copyTemplate({ context: mockContext });

    expect(mockContext.generatedFiles.has('test-app/package.json')).toBe(true);
    expect(mockContext.generatedFiles.has('test-app/src')).toBe(true);
    expect(mockContext.generatedFiles.size).toBe(2);
  });

  it('handles empty template directory', async () => {
    mockReaddir.mockResolvedValue([]);

    await copyTemplate({ context: mockContext });

    expect(mockCp).not.toHaveBeenCalled();
    expect(mockContext.generatedFiles.size).toBe(0);
  });

  it('handles copy errors', async () => {
    const mockEntries = [
      { name: 'package.json', isFile: () => true, isDirectory: () => false }
    ];

    mockReaddir.mockResolvedValueOnce(mockEntries);
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

    mockReaddir
      .mockResolvedValueOnce(mockEntries)
      .mockResolvedValueOnce([]);

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

  describe('.template suffix handling', () => {
    it('renames .template files after copying', async () => {
      const templateEntries = [
        { name: 'package.json', isFile: () => true, isDirectory: () => false },
        { name: '.gitignore.template', isFile: () => true, isDirectory: () => false }
      ];

      const destEntries = [
        { name: 'package.json', isFile: () => true, isDirectory: () => false },
        { name: '.gitignore.template', isFile: () => true, isDirectory: () => false }
      ];

      mockReaddir
        .mockResolvedValueOnce(templateEntries) // templateDir read
        .mockResolvedValueOnce(destEntries); // dest read for processTemplateFiles

      await copyTemplate({ context: mockContext });

      expect(mockRename).toHaveBeenCalledWith(
        '/path/to/test-app/.gitignore.template',
        '/path/to/test-app/.gitignore'
      );
    });

    it('processes .template files in subdirectories', async () => {
      const templateEntries = [
        { name: 'src', isFile: () => false, isDirectory: () => true }
      ];

      const destEntries = [
        { name: 'src', isFile: () => false, isDirectory: () => true }
      ];

      const nestedEntries = [
        { name: '.env.local.template', isFile: () => true, isDirectory: () => false }
      ];

      mockReaddir
        .mockResolvedValueOnce(templateEntries) // templateDir read
        .mockResolvedValueOnce(destEntries) // dest read
        .mockResolvedValueOnce(nestedEntries); // src subdirectory read

      await copyTemplate({ context: mockContext });

      expect(mockRename).toHaveBeenCalledWith(
        '/path/to/test-app/src/.env.local.template',
        '/path/to/test-app/src/.env.local'
      );
    });

    it('updates generatedFiles for renamed .template files', async () => {
      const templateEntries = [
        { name: '.gitignore.template', isFile: () => true, isDirectory: () => false },
        { name: '.npmrc.template', isFile: () => true, isDirectory: () => false }
      ];

      const destEntries = [
        { name: '.gitignore.template', isFile: () => true, isDirectory: () => false },
        { name: '.npmrc.template', isFile: () => true, isDirectory: () => false }
      ];

      mockReaddir
        .mockResolvedValueOnce(templateEntries)
        .mockResolvedValueOnce(destEntries);

      await copyTemplate({ context: mockContext });

      // Should have the renamed files, not the .template versions
      expect(mockContext.generatedFiles.has('test-app/.gitignore')).toBe(true);
      expect(mockContext.generatedFiles.has('test-app/.npmrc')).toBe(true);
      expect(mockContext.generatedFiles.has('test-app/.gitignore.template')).toBe(false);
      expect(mockContext.generatedFiles.has('test-app/.npmrc.template')).toBe(false);
    });

    it('handles multiple .template files', async () => {
      const templateEntries = [
        { name: '.gitignore.template', isFile: () => true, isDirectory: () => false },
        { name: '.npmrc.template', isFile: () => true, isDirectory: () => false },
        { name: '.env.template', isFile: () => true, isDirectory: () => false }
      ];

      const destEntries = [
        { name: '.gitignore.template', isFile: () => true, isDirectory: () => false },
        { name: '.npmrc.template', isFile: () => true, isDirectory: () => false },
        { name: '.env.template', isFile: () => true, isDirectory: () => false }
      ];

      mockReaddir
        .mockResolvedValueOnce(templateEntries)
        .mockResolvedValueOnce(destEntries);

      await copyTemplate({ context: mockContext });

      expect(mockRename).toHaveBeenCalledTimes(3);
      expect(mockRename).toHaveBeenCalledWith(
        '/path/to/test-app/.gitignore.template',
        '/path/to/test-app/.gitignore'
      );
      expect(mockRename).toHaveBeenCalledWith(
        '/path/to/test-app/.npmrc.template',
        '/path/to/test-app/.npmrc'
      );
      expect(mockRename).toHaveBeenCalledWith(
        '/path/to/test-app/.env.template',
        '/path/to/test-app/.env'
      );
    });

    it('handles deeply nested .template files', async () => {
      const templateEntries = [
        { name: 'src', isFile: () => false, isDirectory: () => true }
      ];

      const destRootEntries = [
        { name: 'src', isFile: () => false, isDirectory: () => true }
      ];

      const srcEntries = [
        { name: 'config', isFile: () => false, isDirectory: () => true }
      ];

      const configEntries = [
        { name: '.secrets.template', isFile: () => true, isDirectory: () => false }
      ];

      mockReaddir
        .mockResolvedValueOnce(templateEntries) // templateDir
        .mockResolvedValueOnce(destRootEntries) // dest root
        .mockResolvedValueOnce(srcEntries) // src
        .mockResolvedValueOnce(configEntries); // config

      await copyTemplate({ context: mockContext });

      expect(mockRename).toHaveBeenCalledWith(
        '/path/to/test-app/src/config/.secrets.template',
        '/path/to/test-app/src/config/.secrets'
      );
    });

    it('does not rename files without .template suffix', async () => {
      const templateEntries = [
        { name: 'package.json', isFile: () => true, isDirectory: () => false },
        { name: 'README.md', isFile: () => true, isDirectory: () => false }
      ];

      const destEntries = [
        { name: 'package.json', isFile: () => true, isDirectory: () => false },
        { name: 'README.md', isFile: () => true, isDirectory: () => false }
      ];

      mockReaddir
        .mockResolvedValueOnce(templateEntries)
        .mockResolvedValueOnce(destEntries);

      await copyTemplate({ context: mockContext });

      expect(mockRename).not.toHaveBeenCalled();
    });
  });
});
