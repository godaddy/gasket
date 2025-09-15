const mockRm = vi.fn();
const mockExec = vi.fn();

vi.mock('fs/promises', () => ({
  rm: mockRm
}));

vi.mock('@gasket/utils', () => ({
  PackageManager: vi.fn().mockImplementation(() => ({
    exec: mockExec
  }))
}));

const installTemplateDep = (await import('../../../../lib/scaffold/actions/install-template-deps.js')).default;

describe('installTemplateDep', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      dest: '/path/to/test-app',
      tmpDir: '/tmp/gasket-template-test-app-xyz',
      templateName: '@gasket/template-test@1.0.0',
      messages: []
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('is decorated action', () => {
    expect(installTemplateDep).toHaveProperty('wrapped');
  });

  it('installs dependencies and cleans up successfully', async () => {
    mockExec.mockResolvedValue();
    mockRm.mockResolvedValue();

    await installTemplateDep({ context: mockContext });

    expect(mockExec).toHaveBeenCalledWith('ci');
    expect(mockRm).toHaveBeenCalledWith('/tmp/gasket-template-test-app-xyz', { recursive: true });
  });

  it('handles peer dependency errors with --legacy-peer-deps retry', async () => {
    const peerDepError = {
      stderr: 'ERESOLVE unable to resolve dependency tree',
      message: 'peer dep error'
    };

    mockExec
      .mockRejectedValueOnce(peerDepError)
      .mockResolvedValueOnce(); // Second call succeeds
    mockRm.mockResolvedValue();

    // Mock console.warn to avoid output during tests
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();

    await installTemplateDep({ context: mockContext });

    expect(mockExec).toHaveBeenCalledTimes(2);
    expect(mockExec).toHaveBeenCalledWith('ci');
    expect(mockExec).toHaveBeenCalledWith('ci', ['--legacy-peer-deps']);
    expect(consoleWarnSpy).toHaveBeenCalledWith('Peer dependency conflict detected, retrying with --legacy-peer-deps...');
    expect(mockRm).toHaveBeenCalledWith('/tmp/gasket-template-test-app-xyz', { recursive: true });
    expect(mockContext.messages).toContain('Dependencies were installed with --legacy-peer-deps due to confilct');

    consoleWarnSpy.mockRestore();
  });

  it('handles different peer dependency error patterns', async () => {
    const testCases = [
      { stderr: 'peer dep conflict', message: 'peer dependency issue' },
      { stderr: 'PEERINVALID package', message: 'invalid peer' },
      { stderr: 'peer dependencies not met', message: 'dependencies issue' },
      { stderr: 'ERESOLVE could not resolve', message: 'resolve error' }
    ];

    for (const errorCase of testCases) {
      vi.clearAllMocks();
      mockContext.messages = [];

      mockExec
        .mockRejectedValueOnce(errorCase)
        .mockResolvedValueOnce();
      mockRm.mockResolvedValue();

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();

      await installTemplateDep({ context: mockContext });

      expect(mockExec).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    }
  });

  it('throws error when --legacy-peer-deps also fails', async () => {
    const peerDepError = {
      stderr: 'peer dep error',
      message: 'peer dependency issue'
    };
    const retryError = {
      message: 'Still failed with legacy peer deps'
    };

    mockExec
      .mockRejectedValueOnce(peerDepError)
      .mockRejectedValueOnce(retryError);
    mockRm.mockResolvedValue();

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();

    await expect(installTemplateDep({ context: mockContext }))
      .rejects.toThrow('Failed to install dependencies even with --legacy-peer-deps: Still failed with legacy peer deps');

    expect(mockRm).toHaveBeenCalledWith('/tmp/gasket-template-test-app-xyz', { recursive: true });
    consoleWarnSpy.mockRestore();
  });

  it('throws error for non-peer dependency issues', async () => {
    const networkError = {
      stderr: 'Network timeout',
      message: 'Network error'
    };

    mockExec.mockRejectedValueOnce(networkError);
    mockRm.mockResolvedValue();

    await expect(installTemplateDep({ context: mockContext }))
      .rejects.toEqual(networkError);

    expect(mockExec).toHaveBeenCalledTimes(1);
    expect(mockRm).toHaveBeenCalledWith('/tmp/gasket-template-test-app-xyz', { recursive: true });
  });

  it('ignores cleanup errors during successful installation', async () => {
    mockExec.mockResolvedValue();
    mockRm.mockRejectedValue(new Error('Cannot remove temp directory'));

    // Should not throw due to cleanup error
    await installTemplateDep({ context: mockContext });

    expect(mockExec).toHaveBeenCalledWith('ci');
  });

  it('ignores cleanup errors during error handling', async () => {
    const installError = new Error('Install failed');
    mockExec.mockRejectedValue(installError);
    mockRm.mockRejectedValue(new Error('Cannot remove temp directory'));

    await expect(installTemplateDep({ context: mockContext }))
      .rejects.toEqual(installError);
  });

  it('creates PackageManager with correct options', async () => {
    const { PackageManager } = await import('@gasket/utils');

    mockExec.mockResolvedValue();
    mockRm.mockResolvedValue();

    await installTemplateDep({ context: mockContext });

    expect(PackageManager).toHaveBeenCalledWith({
      packageManager: 'npm',
      dest: '/path/to/test-app'
    });
  });

  it('handles context without tmpDir (local template)', async () => {
    mockContext.tmpDir = null; // Simulates local template path
    mockExec.mockResolvedValue();

    await installTemplateDep({ context: mockContext });

    expect(mockExec).toHaveBeenCalledWith('ci');
    expect(mockRm).not.toHaveBeenCalled(); // No cleanup needed for local templates
  });

  describe('isPeerDependencyError', () => {
    it('detects various peer dependency error patterns', async () => {
      const errorPatterns = [
        'PEER DEP conflict detected',
        'peerinvalid package found',
        'Peer dependencies not satisfied',
        'ERESOLVE unable to resolve'
      ];

      for (const pattern of errorPatterns) {
        vi.clearAllMocks();
        mockContext.messages = [];

        mockExec
          .mockRejectedValueOnce({ stderr: pattern })
          .mockResolvedValueOnce();
        mockRm.mockResolvedValue();

        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();

        await installTemplateDep({ context: mockContext });

        expect(mockExec).toHaveBeenCalledTimes(2);
        consoleWarnSpy.mockRestore();
      }
    });

    it('does not treat non-peer errors as peer dependency errors', async () => {
      const nonPeerErrors = [
        'Network timeout',
        'Authentication failed',
        'Package not found',
        'Checksum mismatch'
      ];

      for (const errorMessage of nonPeerErrors) {
        vi.clearAllMocks();

        const error = { stderr: errorMessage, message: errorMessage };
        mockExec.mockRejectedValueOnce(error);
        mockRm.mockResolvedValue();

        await expect(installTemplateDep({ context: mockContext }))
          .rejects.toEqual(error);

        expect(mockExec).toHaveBeenCalledTimes(1); // Should not retry
      }
    });
  });
});
