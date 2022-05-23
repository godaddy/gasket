const sinon = require('sinon');
const assume = require('assume');
const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const { promisify } = require('util');
const proxyquire = require('proxyquire');

const fixtures = path.resolve(__dirname, '..', '..', '..', 'fixtures');

describe('generateFiles', () => {
  let mockContext, mockImports, generateFiles;
  let globSpy, readFileSpy, writeFileStub, mkdirpStub, registerHelperSpy;

  beforeEach(() => {

    readFileSpy = sinon.spy(fs.promises.readFile);
    writeFileStub = sinon.stub().resolves();
    mkdirpStub = sinon.stub().resolves();

    mockImports = {
      'handlebars': {
        create: () => {
          const handlebars = Handlebars.create();
          registerHelperSpy = sinon.spy(handlebars, 'registerHelper');
          return handlebars;
        }
      },
      'util': {
        promisify: f => {
          globSpy = sinon.spy(promisify(f));
          return globSpy;
        }
      },
      'mkdirp': mkdirpStub,
      'fs': {
        promises: {
          readFile: readFileSpy,
          writeFile: writeFileStub
        }
      },
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    generateFiles = proxyquire('../../../../src/scaffold/actions/generate-files', mockImports);

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
    sinon.restore();
  });

  it('is decorated action', async () => {
    assume(generateFiles).property('wrapped');
  });

  it('early exit if not files', async () => {
    mockContext.files.globSets = [];
    await generateFiles(mockContext);
    assume(globSpy).not.called();
  });

  it('reads expected source files', async () => {
    await generateFiles(mockContext);
    assume(readFileSpy).is.calledWithMatch('gasket-cli/test/fixtures/generator/file-a.md');
    assume(readFileSpy).is.calledWithMatch('gasket-cli/test/fixtures/generator/file-b.md');
  });

  it('writes expected target files', async () => {
    await generateFiles(mockContext);
    assume(writeFileStub).is.calledWithMatch('/path/to/my-app/file-a.md');
    assume(writeFileStub).is.calledWithMatch('/path/to/my-app/file-b.md');
  });

  it('shows warning spinner for any warnings', async () => {
    const warnStub = sinon.stub();

    mockContext.files.globSets = [{
      globs: [fixtures + '/generator/missing/*'],
      source: {
        name: '@gasket/plugin-missing-example'
      }
    }];

    await generateFiles.wrapped(mockContext, { warn: warnStub });
    assume(mockContext.warnings).lengthOf(1);
    assume(warnStub).called();
  });

  describe('handlebars', function () {
    it('adds a json helper to handlebars', async () => {
      await generateFiles(mockContext);
      assume(registerHelperSpy).calledWith('json');
    });

    it('adds a jspretty helper to handlebars', async () => {
      await generateFiles(mockContext);
      assume(registerHelperSpy).calledWith('jspretty');
    });

    it('template handles string replacement', async () => {
      await generateFiles(mockContext);
      // get the correct args as calls may be unordered
      const args = writeFileStub.args.find(call => call[0].includes('file-a.md'));
      assume(args[1]).includes('The app name is my-app');
    });

    it('template handles replacement with helpers', async () => {
      await generateFiles(mockContext);
      // get the correct args as calls may be unordered
      const args = writeFileStub.args.find(call => call[0].includes('file-b.md'));
      assume(args[1]).includes(`'source':{'name':'@gasket/plugin-example'}`);
    });

    it('template handles compile errors', async () => {
      mockContext.files.globSets = [{
        globs: [fixtures + '/generator/missing/*'],
        source: {
          name: '@gasket/plugin-missing-example'
        }
      }];
      await generateFiles(mockContext);
      const args = writeFileStub.args.find(call => call[0].includes('file-a.md'));

      // assume output file falls back to source content
      assume(args[1]).includes(`The context does not have {{{ jspretty missing }}}`);

      // assume a cli warning was added with relevant message
      assume(mockContext.warnings).lengthOf(1);
      assume(mockContext.warnings[0]).includes(
        `Error templating /path/to/my-app/file-a.md: Cannot read properties of undefined`);
    });
  });

  describe('_getDescriptors', function () {

    it('is async', async function () {
      const results = generateFiles._getDescriptors(mockContext);
      assume(results).instanceOf(Promise);
    });

    it('globs each globSet pattern', async function () {
      await generateFiles._getDescriptors(mockContext);
      assume(globSpy).called();
    });

    it('returns flat array of descriptor objects', async function () {
      const results = await generateFiles._getDescriptors(mockContext);
      assume(results).lengthOf(2);
      assume(results[0]).objectContaining({
        target: 'file-a.md',
        from: '@gasket/plugin-example'
      });
      assume(results[1]).objectContaining({
        target: 'file-b.md',
        from: '@gasket/plugin-example'
      });
    });

    it('descriptor has target destination', async function () {
      const results = await generateFiles._getDescriptors(mockContext);
      assume(results[0]).objectContaining({
        targetFile: sinon.match('/path/to/my-app/file-a.md')
      });
    });

    it('descriptor has source file path', async function () {
      const results = await generateFiles._getDescriptors(mockContext);
      assume(results[0]).objectContaining({
        srcFile: sinon.match('/gasket-cli/test/fixtures/generator/file-a.md')
      });
    });

    it('descriptor has glob pattern and resolved base path', async function () {
      const results = await generateFiles._getDescriptors(mockContext);
      assume(results[0]).objectContaining({
        pattern: sinon.match('/gasket-cli/test/fixtures/generator/*'),
        base: sinon.match(/.+fixtures\/generator$/)
      });
    });

    it('works with dot file patterns', async function () {
      mockContext.files.globSets = [{
        globs: [fixtures + '/generator/.*'],
        source: {
          name: '@gasket/plugin-hidden-example'
        }
      }];
      const results = await generateFiles._getDescriptors(mockContext);
      assume(results).lengthOf(1);
      assume(results[0]).objectContaining({
        pattern: sinon.match('/gasket-cli/test/fixtures/generator/.*'),
        base: sinon.match(/.+fixtures\/generator$/),
        srcFile: sinon.match('/gasket-cli/test/fixtures/generator/.dot-file-a.md'),
        targetFile: '/path/to/my-app/.dot-file-a.md',
        target: '.dot-file-a.md',
        from: '@gasket/plugin-hidden-example'
      });
    });

    it('works with .template extensions', async function () {
      mockContext.files.globSets = [{
        globs: [fixtures + '/generator/other/*'],
        source: {
          name: '@gasket/plugin-template-example'
        }
      }];
      const results = await generateFiles._getDescriptors(mockContext);
      assume(results).lengthOf(1);
      assume(results[0]).objectContaining({
        pattern: sinon.match('/gasket-cli/test/fixtures/generator/other/*'),
        base: sinon.match(/.+fixtures\/generator\/other$/),
        srcFile: sinon.match('/gasket-cli/test/fixtures/generator/other/file-b.md.template'),
        targetFile: '/path/to/my-app/file-b.md',
        target: 'file-b.md',
        from: '@gasket/plugin-template-example'
      });
    });

    it('works with recursive patterns', async function () {
      mockContext.files.globSets = [{
        globs: [fixtures + '/generator/**/*'],
        source: {
          name: '@gasket/plugin-example'
        }
      }];
      const results = await generateFiles._getDescriptors(mockContext);
      assume(results).lengthOf(5);
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
      assume(results).lengthOf(2);
      assume(results[0]).objectContaining({
        pattern: sinon.match('/gasket-cli/test/fixtures/generator/override/*'),
        base: sinon.match(/.+fixtures\/generator\/override$/),
        srcFile: sinon.match('/gasket-cli/test/fixtures/generator/override/file-a.md'),
        targetFile: '/path/to/my-app/file-a.md',
        target: 'file-a.md',
        from: '@gasket/plugin-override-example',
        overrides: '@gasket/plugin-example'
      });
    });
  });
});
