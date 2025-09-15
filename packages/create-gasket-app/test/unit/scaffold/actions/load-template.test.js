const mockMkdtemp = vi.fn();
const mockRm = vi.fn();
const mockSpawnNpm = vi.fn();

vi.mock('fs/promises', () => ({
  mkdtemp: mockMkdtemp,
  rm: mockRm
}));

vi.mock('@gasket/utils', () => ({
  PackageManager: vi.fn().mockImplementation(() => ({
    exec: mockSpawnNpm
  }))
}));

const loadTemplate = (await import('../../../../lib/scaffold/actions/load-template.js')).default;

describe('loadTemplate', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      appName: 'test-app',
      dest: '/path/to/test-app',
      cwd: '/path/to',
      template: '@gasket/template-test@1.0.0',
      templatePath: null,
      messages: []
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('is decorated action', () => {
    expect(loadTemplate).toHaveProperty('wrapped');
  });

  it('does nothing if neither template nor templatePath is provided', async () => {
    mockContext.template = null;
    mockContext.templatePath = null;

    await loadTemplate({ context: mockContext });

    expect(mockMkdtemp).not.toHaveBeenCalled();
    expect(mockSpawnNpm).not.toHaveBeenCalled();
  });

  it('uses local template when templatePath is provided', async () => {
    mockContext.template = null;
    mockContext.templatePath = '/local/template';

    await loadTemplate({ context: mockContext });

    expect(mockContext.templateDir).toBe('/local/template/template');
    expect(mockContext.templateName).toBe('local template at /local/template/template');
    expect(mockContext.tmpDir).toBeUndefined();
    expect(mockContext.messages).toContain('Template local template at /local/template/template loaded');
  });

  it('downloads and installs remote template', async () => {
    const mockTmpDir = '/tmp/gasket-template-test-app-xyz';
    mockMkdtemp.mockResolvedValue(mockTmpDir);
    mockSpawnNpm.mockResolvedValue();

    await loadTemplate({ context: mockContext });

    expect(mockMkdtemp).toHaveBeenCalledWith(
      expect.stringContaining('gasket-template-test-app')
    );
    expect(mockSpawnNpm).toHaveBeenCalledWith('install', ['@gasket/template-test@1.0.0']);
    expect(mockContext.templateDir).toBe(`${mockTmpDir}/node_modules/@gasket/template-test/template`);
    expect(mockContext.templateName).toBe('@gasket/template-test@1.0.0');
    expect(mockContext.tmpDir).toBe(mockTmpDir);
    expect(mockContext.messages).toContain('Template @gasket/template-test@1.0.0 loaded');
  });

  it('handles template without version tag', async () => {
    mockContext.template = '@gasket/template-test';
    const mockTmpDir = '/tmp/gasket-template-test-app-xyz';
    mockMkdtemp.mockResolvedValue(mockTmpDir);
    mockSpawnNpm.mockResolvedValue();

    await loadTemplate({ context: mockContext });

    expect(mockSpawnNpm).toHaveBeenCalledWith('install', ['@gasket/template-test@latest']);
    expect(mockContext.templateName).toBe('@gasket/template-test@latest');
  });

  it('handles registry errors and cleans up', async () => {
    const mockTmpDir = '/tmp/gasket-template-test-app-xyz';
    mockMkdtemp.mockResolvedValue(mockTmpDir);
    mockSpawnNpm.mockRejectedValue({
      stderr: 'package @gasket/template-invalid is not in this registry',
      message: 'Install failed'
    });

    await expect(loadTemplate({ context: mockContext }))
      .rejects.toThrow('Template not found in registry: @gasket/template-test@1.0.0');

    expect(mockRm).toHaveBeenCalledWith(mockTmpDir, { recursive: true });
  });

  it('handles other install errors and cleans up', async () => {
    const mockTmpDir = '/tmp/gasket-template-test-app-xyz';
    mockMkdtemp.mockResolvedValue(mockTmpDir);
    mockSpawnNpm.mockRejectedValue({
      stderr: 'Network error',
      message: 'Install failed'
    });

    await expect(loadTemplate({ context: mockContext }))
      .rejects.toThrow('Failed to install template @gasket/template-test@1.0.0: Network error');

    expect(mockRm).toHaveBeenCalledWith(mockTmpDir, { recursive: true });
  });

  it('ignores cleanup errors', async () => {
    const mockTmpDir = '/tmp/gasket-template-test-app-xyz';
    mockMkdtemp.mockResolvedValue(mockTmpDir);
    mockSpawnNpm.mockRejectedValue(new Error('Install failed'));
    mockRm.mockRejectedValue(new Error('Cannot remove directory'));

    // Should not throw due to cleanup error
    await expect(loadTemplate({ context: mockContext }))
      .rejects.toThrow('Failed to install template @gasket/template-test@1.0.0: Install failed');
  });

  describe('parseTemplateNameAndVersion', () => {
    it('parses template with version', async () => {
      mockContext.template = '@gasket/template-test@^2.1.0';
      const mockTmpDir = '/tmp/gasket-template-test-app-xyz';
      mockMkdtemp.mockResolvedValue(mockTmpDir);
      mockSpawnNpm.mockResolvedValue();

      await loadTemplate({ context: mockContext });

      expect(mockSpawnNpm).toHaveBeenCalledWith('install', ['@gasket/template-test@^2.1.0']);
    });

    it('parses template with tilde version', async () => {
      mockContext.template = '@gasket/template-test@~1.2.3';
      const mockTmpDir = '/tmp/gasket-template-test-app-xyz';
      mockMkdtemp.mockResolvedValue(mockTmpDir);
      mockSpawnNpm.mockResolvedValue();

      await loadTemplate({ context: mockContext });

      expect(mockSpawnNpm).toHaveBeenCalledWith('install', ['@gasket/template-test@~1.2.3']);
    });

    it('parses template with beta version', async () => {
      mockContext.template = '@gasket/template-test@1.0.0-beta.1';
      const mockTmpDir = '/tmp/gasket-template-test-app-xyz';
      mockMkdtemp.mockResolvedValue(mockTmpDir);
      mockSpawnNpm.mockResolvedValue();

      await loadTemplate({ context: mockContext });

      expect(mockSpawnNpm).toHaveBeenCalledWith('install', ['@gasket/template-test@1.0.0-beta.1']);
    });

    it('parses template with file path version', async () => {
      mockContext.template = 'my-template@file:../local-template';
      const mockTmpDir = '/tmp/gasket-template-test-app-xyz';
      mockMkdtemp.mockResolvedValue(mockTmpDir);
      mockSpawnNpm.mockResolvedValue();

      await loadTemplate({ context: mockContext });

      expect(mockSpawnNpm).toHaveBeenCalledWith('install', ['my-template@file:../local-template']);
    });
  });
});
