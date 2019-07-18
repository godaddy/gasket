const sinon = require('sinon');
const assume = require('assume');

describe('printReport', () => {
  let sandbox, printReport;
  let mockContext, logStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    logStub = sandbox.stub(console, 'log');

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      fullPresets: [],
      plugins: [],
      presetPlugins: [],
      generatedFiles: new Set(),
      messages: [],
      warnings: [],
      errors: [],
      nextSteps: []
    };

    printReport = require('../../../../src/scaffold/actions/print-report');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(printReport).property('wrapped');
  });

  it('outputs banner', function () {
    printReport(mockContext);
    assume(logStub).calledWithMatch(`
    _____         __       __
   / ___/__ ____ / /_____ / /_
  / (_ / _ \`(_-</  '_/ -_) __/
  \\___/\\_,_/___/_/\\_\\\\__/\\__/`);
  });

  it('outputs warning and error count', function () {
    printReport(mockContext);
    assume(logStub).calledWithMatch('0 warnings');
    assume(logStub).calledWithMatch('0 errors');

    mockContext.warnings = ['one', 'two'];
    mockContext.errors = ['one'];
    printReport(mockContext);
    assume(logStub).calledWithMatch('2 warnings');
    assume(logStub).calledWithMatch('1 errors');
  });

  it('outputs titles as Space Case', function () {
    printReport(mockContext);
    assume(logStub).calledWithMatch('App Name');
    assume(logStub).calledWithMatch('Output');
  });

  it('outputs content with indentation', function () {
    printReport(mockContext);
    assume(logStub).calledWithMatch('  my-app');
    assume(logStub).calledWithMatch('  /some/path/my-app');
  });

  it('outputs sections with content', function () {
    mockContext.warnings = ['one', 'two'];
    printReport(mockContext);
    assume(logStub).calledWithMatch('Warnings');
    assume(logStub).calledWithMatch('  one');
    assume(logStub).calledWithMatch('  two');
  });

  it('does not output sections with no content', function () {
    printReport(mockContext);
    assume(logStub).not.calledWithMatch('Warnings');
  });

  it('outputs sorted generated files', function () {
    mockContext.generatedFiles.add('zebra');
    mockContext.generatedFiles.add('apple');
    mockContext.generatedFiles.add('.secret');
    printReport(mockContext);

    const concatOutput = logStub.args.reduce((acc, cur) => acc + cur, '');

    assume(concatOutput).includes('.secret  apple  zebra');
  });
});
