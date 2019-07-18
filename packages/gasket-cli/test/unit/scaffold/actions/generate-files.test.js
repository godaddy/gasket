const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');

describe('generateFiles', () => {
  let sandbox, mockContext, mockFile, mockImports, generateFiles;
  let pumpStub, mapStub, registerHelperStub, compileStub, templateNextStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    pumpStub = sandbox.stub();
    mapStub = sandbox.stub().returns(sandbox.stub());
    registerHelperStub = sandbox.stub();
    compileStub = sandbox.stub().returns(() => 'Compiled content');
    templateNextStub = sandbox.stub();

    pumpStub.callsFake((src, templateFile, dest, cb) => {
      templateFile(mockFile, templateNextStub);
      return cb();
    });

    mockImports = {
      'handlebars': {
        create: () => ({
          registerHelper: registerHelperStub,
          compile: compileStub
        })
      },
      'vinyl-fs': {
        src: sandbox.stub(),
        dest: sandbox.stub()
      },
      'pump': pumpStub,
      'map-stream': mapStub,
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    generateFiles = proxyquire('../../../../src/scaffold/actions/generate-files', mockImports);

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      files: {
        globs: ['some/file']
      },
      warnings: [],
      errors: [],
      generatedFiles: new Set()
    };

    mockFile = {
      isDirectory: () => false,
      contents: 'some contents',
      basename: 'mock-file.md',
      extname: '.md',
      path: '/path/to/mock-file.md'
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(generateFiles).property('wrapped');
  });

  it('early exit if not files', async () => {
    mockContext.files.globs = [];
    await generateFiles(mockContext);
    assume(pumpStub).not.called();
  });

  it('adds a json helper to handlebars', async () => {
    await generateFiles(mockContext);
    assume(registerHelperStub).is.called();
    assume(registerHelperStub.args[0][0]).to.eqls('json');
  });

  it('adds a jspretty helper to handlebars', async () => {
    await generateFiles(mockContext);
    assume(registerHelperStub).is.called();
    assume(registerHelperStub.args[1][0]).to.eqls('jspretty');
  });

  it('pump resolves promise', async () => {
    await generateFiles(mockContext);
    assume(pumpStub).is.called();
  });

  it('pump rejects promise for errors', async () => {
    pumpStub.callsFake((src, templateFile, dest, cb) => {
      return cb('BAD');
    });
    try {
      await generateFiles(mockContext);
    } catch (e) {
      assume(e).is.equal('BAD');
    }
  });

  describe('templateFile', () => {
    beforeEach(() => {
      mapStub.callsFake(templateFile => templateFile);
    });

    it('early return if file is directory', async () => {
      mockFile.isDirectory = () => true;
      await generateFiles(mockContext);
      const results = templateNextStub.args[0][1];
      assume(results.source).is.undefined();
    });

    it('executes callback with transformed file', async () => {
      await generateFiles(mockContext);
      assume(templateNextStub).is.called();
      assume(templateNextStub.args[0][0]).is.null();
      assume(templateNextStub.args[0][1]).equals(mockFile);
    });

    it('sets source to original contents', async () => {
      const { contents: mockContents } = mockFile;
      await generateFiles(mockContext);
      const results = templateNextStub.args[0][1];
      assume(results.source).equals(mockContents);
    });

    it('sets contents to buffer of compiled results', async () => {
      const { contents: mockContents } = mockFile;
      await generateFiles(mockContext);
      const results = templateNextStub.args[0][1];
      assume(results.contents).not.equals(mockContents);
      assume(results.contents).instanceOf(Buffer);
    });

    it('handles compile error and sets warnings', async () => {
      compileStub.throws(new Error('something bad happened'));
      await generateFiles(mockContext);
      const results = templateNextStub.args[0][1];
      assume(results.contents).equals(mockFile.contents);
      assume(mockContext.warnings).lengthOf(1);
      assume(mockContext.warnings[0]).includes('something bad happened');
    });

    it('leaves extname in tact', async () => {
      await generateFiles(mockContext);
      const results = templateNextStub.args[0][1];
      assume(results.extname).equals('.md');
    });

    it('strips .template from extname', async () => {
      mockFile.extname = '.template';
      await generateFiles(mockContext);
      const results = templateNextStub.args[0][1];
      assume(results.extname).equals('');
    });
  });
});
