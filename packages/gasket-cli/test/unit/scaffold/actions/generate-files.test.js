const mockReadFileStub = jest.fn();
const mockWriteFileStub = jest.fn();
const mockMkdirpStub = jest.fn();
const mockGlobStub = jest.fn();
let registerHelperSpy;

jest.mock('fs', () => {
  const mod = jest.requireActual('fs');
  return {
    ...mod,
    promises: {
      readFile: mockReadFileStub,
      writeFile: mockWriteFileStub
    }
  };
});
jest.mock('mkdirp', () => mockMkdirpStub);
jest.mock('handlebars', () => {
  return {
    create: () => {
      const mod = jest.requireActual('handlebars');
      const handlebars = mod.create();
      registerHelperSpy = jest.spyOn(handlebars, 'registerHelper');
      return handlebars;
    }
  };
});
jest.mock('glob', () => {
  const mod = jest.requireActual('glob');
  return jest.fn(mod);
});

const path = require('path');
const generateFiles = require('../../../../src/scaffold/actions/generate-files');
const fixtures = path.resolve(__dirname, '..', '..', '..', 'fixtures');
const glob = require('glob');
const fs = require('fs');

describe('generateFiles', () => {
  let mockContext;

  beforeEach(() => {
    mockReadFileStub.mockImplementation((file, encoding) => fs.readFileSync(file, encoding)); // eslint-disable-line no-sync
    mockWriteFileStub.mockResolvedValue();
    mockMkdirpStub.mockResolvedValue();
    mockGlobStub.mockResolvedValue([
      '/gasket-cli/test/fixtures/generator/file-a.md',
      '/gasket-cli/test/fixtures/generator/file-b.md'
    ]);

    mockContext = {
      appName: 'my-app',
      dest: '/path/to/my-app',
      files: {
        globSets: [{
          globs: [fixtures + '/generator/*'],
          source: {
            name: '@gasket/plugin-example'
          }
        }]
      },
      warnings: [],
      errors: [],
      generatedFiles: new Set()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is decorated action', async () => {
    expect(generateFiles).toHaveProperty('wrapped');
  });

  it('early exit if not files', async () => {
    mockContext.files.globSets = [];
    await generateFiles(mockContext);
    expect(glob).not.toHaveBeenCalled();
  });

  it('reads expected source files', async () => {
    await generateFiles(mockContext);
    expect(mockReadFileStub).toHaveBeenCalledWith(expect.stringContaining('gasket-cli/test/fixtures/generator/file-a.md'), expect.any(Object));
    expect(mockReadFileStub).toHaveBeenCalledWith(expect.stringContaining('gasket-cli/test/fixtures/generator/file-b.md'), expect.any(Object));
  });

  it('writes expected target files', async () => {
    await generateFiles(mockContext);
    expect(mockWriteFileStub).toHaveBeenCalledWith('/path/to/my-app/file-a.md', expect.any(String), expect.any(Object));
    expect(mockWriteFileStub).toHaveBeenCalledWith('/path/to/my-app/file-b.md', expect.any(String), expect.any(Object));
  });

  it('handles template read errors', async () => {
    mockReadFileStub.mockRejectedValue(new Error('Bogus error occurred'));
    await generateFiles(mockContext);
    expect(mockContext.errors).toHaveLength(2);
    expect(mockContext.errors[0]).toContain('Error reading template');
    expect(mockContext.errors[0]).toContain('file-a.md');
    expect(mockContext.errors[0]).toContain('Bogus error occurred');
    expect(mockContext.errors[1]).toContain('Error reading template');
    expect(mockContext.errors[1]).toContain('file-b.md');
    expect(mockContext.errors[1]).toContain('Bogus error occurred');
  });

  it('handles template dir read errors as warnings', async () => {
    const err = new Error('Bogus error occurred');
    err.code = 'EISDIR';
    mockReadFileStub.mockRejectedValue(err);
    await generateFiles(mockContext);
    expect(mockContext.warnings).toHaveLength(2);
    expect(mockContext.warnings).toContain('Directory matched as template file: /path/to/my-app/file-a.md');
    expect(mockContext.warnings).toContain('Directory matched as template file: /path/to/my-app/file-b.md');
  });

  it('handles dir create errors', async () => {
    mockMkdirpStub.mockRejectedValue(new Error('Bogus error occurred'));
    await generateFiles(mockContext);
    expect(mockContext.errors).toContain('Error creating directory /path/to/my-app: Bogus error occurred');
  });

  it('handles file write errors', async () => {
    mockWriteFileStub.mockRejectedValue(new Error('Bogus error occurred'));
    await generateFiles(mockContext);
    expect(mockContext.errors).toContain('Error writing /path/to/my-app/file-a.md: Bogus error occurred');
    expect(mockContext.errors).toContain('Error writing /path/to/my-app/file-b.md: Bogus error occurred');
  });

  it('shows warning spinner for any warnings', async () => {
    mockReadFileStub.mockRejectedValue({ code: 'EISDIR' });
    const warnStub = jest.fn();

    mockContext.files.globSets = [{
      globs: [fixtures + '/generator/missing/*'],
      source: {
        name: '@gasket/plugin-missing-example'
      }
    }];

    await generateFiles.wrapped(mockContext, { warn: warnStub });
    expect(mockContext.warnings).toHaveLength(1);
    expect(warnStub).toHaveBeenCalled();
  });

  describe('handlebars', function () {
    it('adds a json helper to handlebars', async () => {
      await generateFiles(mockContext);
      expect(registerHelperSpy).toHaveBeenNthCalledWith(1, 'json', expect.any(Function));
    });

    it('adds a jspretty helper to handlebars', async () => {
      await generateFiles(mockContext);
      expect(registerHelperSpy).toHaveBeenNthCalledWith(2, 'jspretty', expect.any(Function));
    });

    it('template handles string replacement', async () => {
      await generateFiles(mockContext);
      // get the correct args as calls may be unordered
      const args = mockWriteFileStub.mock.calls.find(call => call[0].includes('file-a.md'));
      expect(args[1]).toContain('The app name is my-app');
    });

    it('template handles replacement with helpers', async () => {
      await generateFiles(mockContext);
      // get the correct args as calls may be unordered
      const args = mockWriteFileStub.mock.calls.find(call => call[0].includes('file-b.md'));
      expect(args[1]).toContain(`'source':{'name':'@gasket/plugin-example'}`);
    });

    it('template handles compile errors', async () => {
      mockContext.files.globSets = [{
        globs: [fixtures + '/generator/missing/*'],
        source: {
          name: '@gasket/plugin-missing-example'
        }
      }];
      await generateFiles(mockContext);
      const args = mockWriteFileStub.mock.calls.find(call => call[0].includes('file-a.md'));
      // expect output file falls back to source content
      expect(args[1]).toContain(`The context does not have {{{ jspretty missing }}}`);

      // expect a cli warning was added with relevant message
      expect(mockContext.warnings).toHaveLength(1);
      expect(mockContext.warnings[0]).toContain(`Error templating /path/to/my-app/file-a.md: Cannot read properties of undefined`);
    });
  });

  describe('_getDescriptors', function () {

    it('is async', async function () {
      const results = generateFiles._getDescriptors(mockContext);
      expect(results).toBeInstanceOf(Promise);
    });

    it('globs each globSet pattern', async function () {
      await generateFiles._getDescriptors(mockContext);
      expect(glob).toHaveBeenCalled();
    });

    it('returns flat array of descriptor objects', async function () {
      const results = await generateFiles._getDescriptors(mockContext);
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual(
        expect.objectContaining({
          target: 'file-a.md',
          from: '@gasket/plugin-example'
        }));
      expect(results[1]).toEqual(
        expect.objectContaining({
          target: 'file-b.md',
          from: '@gasket/plugin-example'
        }));
    });

    it('descriptor has target destination', async function () {
      const results = await generateFiles._getDescriptors(mockContext);
      expect(results[0]).toEqual(
        expect.objectContaining({
          targetFile: expect.stringContaining('/path/to/my-app/file-a.md')
        }));
    });

    it('descriptor has source file path', async function () {
      const results = await generateFiles._getDescriptors(mockContext);
      expect(results[0]).toEqual(
        expect.objectContaining({
          srcFile: expect.stringContaining('/gasket-cli/test/fixtures/generator/file-a.md')
        }));
    });

    it('descriptor has glob pattern and resolved base path', async function () {
      const results = await generateFiles._getDescriptors(mockContext);
      expect(results[0]).toEqual(
        expect.objectContaining({
          pattern: expect.stringContaining('/gasket-cli/test/fixtures/generator/*'),
          base: expect.stringMatching(/.+fixtures\/generator$/)
        }));
    });

    it('works with dot file patterns', async function () {
      mockContext.files.globSets = [{
        globs: [fixtures + '/generator/.*'],
        source: {
          name: '@gasket/plugin-hidden-example'
        }
      }];
      const results = await generateFiles._getDescriptors(mockContext);
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(
        expect.objectContaining({
          pattern: expect.stringContaining('/gasket-cli/test/fixtures/generator/.*'),
          base: expect.stringMatching(/.+fixtures\/generator$/),
          srcFile: expect.stringContaining('/gasket-cli/test/fixtures/generator/.dot-file-a.md'),
          targetFile: '/path/to/my-app/.dot-file-a.md',
          target: '.dot-file-a.md',
          from: '@gasket/plugin-hidden-example'
        }));
    });

    it('works with .template extensions', async function () {
      mockContext.files.globSets = [{
        globs: [fixtures + '/generator/other/*'],
        source: {
          name: '@gasket/plugin-template-example'
        }
      }];
      const results = await generateFiles._getDescriptors(mockContext);
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(
        expect.objectContaining({
          pattern: expect.stringContaining('/gasket-cli/test/fixtures/generator/other/*'),
          base: expect.stringMatching(/.+fixtures\/generator\/other$/),
          srcFile: expect.stringContaining('/gasket-cli/test/fixtures/generator/other/file-b.md.template'),
          targetFile: '/path/to/my-app/file-b.md',
          target: 'file-b.md',
          from: '@gasket/plugin-template-example'
        }));
    });

    it('works with recursive patterns', async function () {
      mockContext.files.globSets = [{
        globs: [fixtures + '/generator/**/*'],
        source: {
          name: '@gasket/plugin-example'
        }
      }];
      const results = await generateFiles._getDescriptors(mockContext);
      expect(results).toHaveLength(5);
    });

    it('works with Windows path separators', async function () {
      mockContext.files.globSets = [{
        globs: [fixtures + '\\generator\\**\\*'],
        source: {
          name: '@gasket/plugin-example'
        }
      }];
      const results = await generateFiles._getDescriptors(mockContext);
      expect(results).toHaveLength(5);
    });

    it('reduces duplicates with overrides prop', async function () {
      mockContext.files.globSets = [{
        globs: [fixtures + '/generator/*'],
        source: {
          name: '@gasket/plugin-example'
        }
      }, {
        globs: [fixtures + '/generator/override/*'],
        source: {
          name: '@gasket/plugin-override-example'
        }
      }];
      const results = await generateFiles._getDescriptors(mockContext);
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual(
        expect.objectContaining({
          pattern: expect.stringContaining('/gasket-cli/test/fixtures/generator/override/*'),
          base: expect.stringMatching(/.+fixtures\/generator\/override$/),
          srcFile: expect.stringContaining('/gasket-cli/test/fixtures/generator/override/file-a.md'),
          targetFile: '/path/to/my-app/file-a.md',
          target: 'file-a.md',
          from: '@gasket/plugin-override-example',
          overrides: '@gasket/plugin-example'
        }));
    });
  });

  describe('_assembleDescriptors', function () {
    const from = '@gasket/plugin-example';

    it('has expected output with *nix paths', function () {
      const results = generateFiles._assembleDescriptors(
        '/path/to/my-app',
        from,
        '/gasket-cli/test/fixtures/rel/../generator/*',
        [
          '/gasket-cli/test/fixtures/generator/file-a.md',
          '/gasket-cli/test/fixtures/generator/file-b.md'
        ]
      );
      expect(results[0]).toEqual(
        expect.objectContaining({
          pattern: expect.stringContaining('/gasket-cli/test/fixtures/rel/../generator/*'),
          base: expect.stringMatching(/.+fixtures\/generator$/),
          srcFile: expect.stringContaining('/gasket-cli/test/fixtures/generator/file-a.md'),
          targetFile: '/path/to/my-app/file-a.md',
          target: 'file-a.md',
          from
        }));
    });

    it('has expected output with windows paths', function () {
      jest.spyOn(path, 'resolve').mockImplementationOnce(f => f.replace('/rel/..', ''));
      path.sep = '\\';

      const results = generateFiles._assembleDescriptors(
        // mixed slashes for testing
        'C:\\path\\to/my-app',
        from,
        'C:/gasket-cli/test/fixtures/rel/../generator/*',
        [
          'C:\\gasket-cli\\test\\fixtures\\generator\\file-a.md',
          // glob may return with forward-slash
          'C:/gasket-cli/test/fixtures/generator/file-b.md'
        ]
      );

      expect(results[0]).toEqual(
        expect.objectContaining({
          pattern: 'C:/gasket-cli/test/fixtures/rel/../generator/*',
          base: expect.stringContaining('C:\\gasket-cli\\test\\fixtures\\generator'),
          srcFile: expect.stringContaining('C:\\gasket-cli\\test\\fixtures\\generator\\file-a.md'),
          targetFile: 'C:\\path\\to\\my-app\\file-a.md',
          target: 'file-a.md',
          from
        }));
      expect(results[1]).toEqual(
        expect.objectContaining({
          srcFile: expect.stringContaining('C:\\gasket-cli\\test\\fixtures\\generator\\file-b.md'),
          targetFile: 'C:\\path\\to\\my-app\\file-b.md',
          target: 'file-b.md',
          from
        }));
    });
  });
});
