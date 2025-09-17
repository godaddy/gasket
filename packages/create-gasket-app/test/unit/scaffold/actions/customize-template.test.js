const mockReadFile = vi.fn();
const mockWriteFile = vi.fn();

vi.mock('fs/promises', () => ({
  readFile: mockReadFile,
  writeFile: mockWriteFile
}));

const customizeTemplate = (await import('../../../../lib/scaffold/actions/customize-template.js')).default;

describe('customizeTemplate', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      appName: 'my-test-app',
      dest: '/path/to/my-test-app',
      templateDir: '/tmp/node_modules/@gasket/template-test/template'
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('is decorated action', () => {
    expect(customizeTemplate).toHaveProperty('wrapped');
  });

  it('does nothing if templateDir is not set', async () => {
    mockContext.templateDir = null;

    await customizeTemplate({ context: mockContext });

    expect(mockReadFile).not.toHaveBeenCalled();
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it('does nothing if appName is not set', async () => {
    mockContext.appName = null;

    await customizeTemplate({ context: mockContext });

    expect(mockReadFile).not.toHaveBeenCalled();
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  describe('package.json customization', () => {
    it('updates package.json name field', async () => {
      const mockPackageJson = {
        name: 'template-name',
        version: '1.0.0',
        dependencies: {
          react: '^17.0.0'
        }
      };

      mockReadFile.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve(JSON.stringify(mockPackageJson, null, 2));
        }
        if (filePath.endsWith('README.md')) {
          return Promise.resolve('# Template Name\n\nTemplate description');
        }
        return Promise.reject(new Error('ENOENT'));
      });

      await customizeTemplate({ context: mockContext });

      expect(mockReadFile).toHaveBeenCalledWith('/path/to/my-test-app/package.json', 'utf8');
      expect(mockWriteFile).toHaveBeenCalledWith(
        '/path/to/my-test-app/package.json',
        JSON.stringify({
          ...mockPackageJson,
          name: 'my-test-app'
        }, null, 2) + '\n'
      );
    });

    it('handles missing package.json gracefully', async () => {
      mockReadFile.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          const error = new Error('ENOENT: no such file or directory');
          error.code = 'ENOENT';
          return Promise.reject(error);
        }
        if (filePath.endsWith('README.md')) {
          return Promise.resolve('# Template Name');
        }
        return Promise.reject(new Error('ENOENT'));
      });

      await customizeTemplate({ context: mockContext });

      expect(mockReadFile).toHaveBeenCalledWith('/path/to/my-test-app/package.json', 'utf8');
      expect(mockWriteFile).not.toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.anything()
      );
    });

    it('warns on package.json parse errors', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      mockReadFile.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve('invalid json {');
        }
        if (filePath.endsWith('README.md')) {
          return Promise.resolve('# Template Name');
        }
        return Promise.reject(new Error('ENOENT'));
      });

      await customizeTemplate({ context: mockContext });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Could not update package.json:')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('README.md customization', () => {
    it('replaces {appName} placeholders with app name', async () => {
      mockReadFile.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve('{"name": "template-name"}');
        }
        if (filePath.endsWith('README.md')) {
          return Promise.resolve('# {appName}\n\nWelcome to {appName}!\n\nTo run {appName}, use npm start.');
        }
        return Promise.reject(new Error('ENOENT'));
      });

      await customizeTemplate({ context: mockContext });

      expect(mockReadFile).toHaveBeenCalledWith('/path/to/my-test-app/README.md', 'utf8');
      expect(mockWriteFile).toHaveBeenCalledWith(
        '/path/to/my-test-app/README.md',
        '# my-test-app\n\nWelcome to my-test-app!\n\nTo run my-test-app, use npm start.'
      );
    });

    it('handles README.md with no placeholders', async () => {
      mockReadFile.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve('{"name": "template-name"}');
        }
        if (filePath.endsWith('README.md')) {
          return Promise.resolve('# Template Name\n\nStatic content without placeholders.');
        }
        return Promise.reject(new Error('ENOENT'));
      });

      await customizeTemplate({ context: mockContext });

      expect(mockWriteFile).toHaveBeenCalledWith(
        '/path/to/my-test-app/README.md',
        '# Template Name\n\nStatic content without placeholders.'
      );
    });

    it('handles empty README.md', async () => {
      mockReadFile.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve('{"name": "template-name"}');
        }
        if (filePath.endsWith('README.md')) {
          return Promise.resolve('');
        }
        return Promise.reject(new Error('ENOENT'));
      });

      await customizeTemplate({ context: mockContext });

      expect(mockWriteFile).toHaveBeenCalledWith(
        '/path/to/my-test-app/README.md',
        ''
      );
    });

    it('handles missing README.md gracefully', async () => {
      mockReadFile.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve('{"name": "template-name"}');
        }
        if (filePath.endsWith('README.md')) {
          const error = new Error('ENOENT: no such file or directory');
          error.code = 'ENOENT';
          return Promise.reject(error);
        }
        return Promise.reject(new Error('ENOENT'));
      });

      await customizeTemplate({ context: mockContext });

      expect(mockReadFile).toHaveBeenCalledWith('/path/to/my-test-app/README.md', 'utf8');
      expect(mockWriteFile).not.toHaveBeenCalledWith(
        expect.stringContaining('README.md'),
        expect.anything()
      );
    });

    it('warns on README.md write errors', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      mockReadFile.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve('{"name": "template-name"}');
        }
        if (filePath.endsWith('README.md')) {
          const error = new Error('Permission denied');
          error.code = 'EACCES';
          return Promise.reject(error);
        }
        return Promise.reject(new Error('ENOENT'));
      });

      await customizeTemplate({ context: mockContext });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Could not update README.md:')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('template file customization', () => {
    it('updates template files with {appName} placeholders', async () => {
      mockReadFile.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve('{"name": "template-name"}');
        }
        if (filePath.endsWith('README.md')) {
          return Promise.resolve('# {appName}');
        }
        if (filePath.endsWith('pages/index.tsx')) {
          return Promise.resolve("<Head title='{appName}' description='Gasket App'/>");
        }
        if (filePath.endsWith('app/page.tsx')) {
          return Promise.resolve("title: '{appName}'");
        }
        return Promise.reject(new Error('ENOENT'));
      });

      await customizeTemplate({ context: mockContext });

      // Check template files were updated
      expect(mockWriteFile).toHaveBeenCalledWith(
        '/path/to/my-test-app/pages/index.tsx',
        "<Head title='my-test-app' description='Gasket App'/>"
      );
      expect(mockWriteFile).toHaveBeenCalledWith(
        '/path/to/my-test-app/app/page.tsx',
        "title: 'my-test-app'"
      );
    });

    it('handles missing template files gracefully', async () => {
      mockReadFile.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve('{"name": "template-name"}');
        }
        if (filePath.endsWith('README.md')) {
          return Promise.resolve('# {appName}');
        }
        if (filePath.endsWith('pages/index.tsx') || filePath.endsWith('app/page.tsx')) {
          const error = new Error('ENOENT: no such file or directory');
          error.code = 'ENOENT';
          return Promise.reject(error);
        }
        return Promise.reject(new Error('ENOENT'));
      });

      await customizeTemplate({ context: mockContext });

      // Should not fail and should not try to write template files that don't exist
      expect(mockWriteFile).not.toHaveBeenCalledWith(
        expect.stringContaining('pages/index.tsx'),
        expect.anything()
      );
      expect(mockWriteFile).not.toHaveBeenCalledWith(
        expect.stringContaining('app/page.tsx'),
        expect.anything()
      );
    });
  });

  it('processes all files in parallel', async () => {
    let readFileCallCount = 0;
    mockReadFile.mockImplementation((filePath) => {
      readFileCallCount++;
      if (filePath.endsWith('package.json')) {
        return new Promise(resolve => {
          setTimeout(() => resolve('{"name": "template-name"}'), 10);
        });
      }
      if (filePath.endsWith('README.md')) {
        return new Promise(resolve => {
          setTimeout(() => resolve('# Template Name'), 5);
        });
      }
      if (filePath.endsWith('pages/index.tsx') || filePath.endsWith('app/page.tsx')) {
        return new Promise(resolve => {
          setTimeout(() => resolve('title: "{appName}"'), 3);
        });
      }
      return Promise.reject(new Error('ENOENT'));
    });

    const startTime = Date.now();
    await customizeTemplate({ context: mockContext });
    const endTime = Date.now();

    expect(readFileCallCount).toBe(4); // package.json, README.md, pages/index.tsx, app/page.tsx
    expect(endTime - startTime).toBeLessThan(30); // Should be parallel, not sequential
  });
});
