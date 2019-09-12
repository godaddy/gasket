/* eslint-disable max-statements */

const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');


describe('create', function () {
  let sandbox, mockImports, CreateCommand;
  let actionStubs, dumpErrorContext, gasket;
  let consoleErrorStub;

  this.timeout(5000);

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    actionStubs = {
      mkDir: sandbox.stub(),
      loadPreset: sandbox.stub(),
      cliVersion: sandbox.stub(),
      globalPrompts: sandbox.stub(),
      setupPkg: sandbox.stub(),
      writePkg: sandbox.stub(),
      installModules: sandbox.stub(),
      linkModules: sandbox.stub(),
      writeGasketConfig: sandbox.stub(),
      loadPkgForDebug: sandbox.stub(),
      promptHooks: sandbox.stub(),
      createHooks: sandbox.stub(),
      generateFiles: sandbox.stub(),
      postCreateHooks: sandbox.stub(),
      applyPresetConfig: sandbox.stub(),
      printReport: sandbox.stub()
    };

    actionStubs.writePkg.update = sandbox.stub();
    actionStubs.installModules.update = sandbox.stub();
    actionStubs.linkModules.update = sandbox.stub();

    gasket = {
      exec: sandbox.stub(),
      execWaterfall: sandbox.stub(),
      config: {}
    };

    dumpErrorContext = sandbox.stub();
    consoleErrorStub = sandbox.stub(console, 'error');

    mockImports = {
      '../scaffold/actions': actionStubs,
      '../command': proxyquire('../../../src/command', {
        '@gasket/plugin-engine': sandbox.stub().returns(gasket)
      }),
      '../scaffold/dump-error-context': dumpErrorContext,
      'ora': () => ({
        warn: sandbox.stub()
      })
    };

    CreateCommand = proxyquire('../../../src/commands/create', mockImports);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('executes expected bootstrap actions', async () => {
    const cmd = new CreateCommand(['myapp', '--presets=nextjs']);
    await cmd.run();

    assume(actionStubs.mkDir).is.called();
    assume(actionStubs.loadPreset).is.called();
    assume(actionStubs.globalPrompts).is.called();
    assume(actionStubs.setupPkg).is.called();
    assume(actionStubs.writePkg).is.called();
    assume(actionStubs.installModules).is.called();
    assume(actionStubs.linkModules).is.called();
    assume(actionStubs.postCreateHooks).is.called();
  });

  it('skips bootstrap actions with --no-bootstrap', async () => {
    const cmd = new CreateCommand(['myapp', '--no-bootstrap', '--presets=nextjs']);
    await cmd.run();

    assume(actionStubs.mkDir).not.called();
  });

  it('executes loadPkgForDebug with --no-bootstrap', async () => {
    const cmd = new CreateCommand(['myapp', '--no-bootstrap', '--presets=nextjs']);
    await cmd.run();

    assume(actionStubs.loadPkgForDebug).is.called();
  });

  it('executes expected generate actions', async () => {
    const cmd = new CreateCommand(['myapp', '--presets=nextjs']);
    await cmd.run();

    assume(actionStubs.promptHooks).is.called();
    assume(actionStubs.createHooks).is.called();
    assume(actionStubs.generateFiles).is.called();
    assume(actionStubs.writeGasketConfig).is.called();
    assume(actionStubs.writePkg).is.called();
    assume(actionStubs.installModules).is.called();
    assume(actionStubs.linkModules).is.called();
    assume(actionStubs.writePkg.update).is.called();
    assume(actionStubs.installModules.update).is.called();
    assume(actionStubs.linkModules.update).is.called();
  });

  it('skips generate actions with --no-generate', async () => {
    const cmd = new CreateCommand(['myapp', '--no-generate', '--presets=nextjs']);
    await cmd.run();

    assume(actionStubs.promptHooks).not.called();
  });

  it('does not execute loadPkgForDebug with --no-bootstrap --no-generate', async () => {
    const cmd = new CreateCommand(['myapp', '--no-bootstrap', '--no-generate', '--presets=nextjs']);
    await cmd.run();

    assume(actionStubs.loadPkgForDebug).not.called();
  });

  it('executes printReport', async () => {
    const cmd = new CreateCommand(['myapp', '--presets=nextjs']);
    await cmd.run();

    assume(actionStubs.printReport).is.called();
  });

  it('exits on action errors', async () => {
    actionStubs.mkDir.rejects(new Error('YOUR DRIVE EXPLODED!'));
    const cmd = new CreateCommand(['myapp', '--presets=nextjs']);
    try {
      await cmd.run();
    } catch (e) {
      assume(e.message).contains('YOUR DRIVE EXPLODED!');
    }
  });

  it('dumps log on errors', async () => {
    actionStubs.mkDir.rejects(new Error('YOUR DRIVE EXPLODED!'));
    const cmd = new CreateCommand(['myapp', '--presets=nextjs']);
    try {
      await cmd.run();
    } catch (e) {
      assume(dumpErrorContext).is.called();
    }
  });

  it('prints exit message', async () => {
    actionStubs.mkDir.rejects(new Error('YOUR DRIVE EXPLODED!'));
    const cmd = new CreateCommand(['myapp', '--presets=nextjs']);
    try {
      await cmd.run();
    } catch (e) {
      assume(consoleErrorStub).is.called();
    }
  });

  it('prints exit message when no preset found', async () => {
    const cmd = new CreateCommand(['myapp']);
    try {
      await cmd.run();
    } catch (e) {
      assume(consoleErrorStub).is.called();
    }
  });

  it('expands comma separated flag inputs to array', () => {
    const result = CreateCommand.flags.plugins.parse('a,b,c');
    assume(result).eqls(['a', 'b', 'c']);
  });
});
