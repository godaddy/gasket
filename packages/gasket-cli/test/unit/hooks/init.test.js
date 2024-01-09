// const proxyquire = require('proxyquire');
// const sinon = require('sinon');
// const assume = require('assume');

describe('init hook', () => {
  let mockError, mockConfig, pluginEngineSpy;
  let initHook;
  let getGasketConfigStub, assignPresetConfigStub, warnStub, errorStub, parseStub, execStub;

  beforeEach(() => {
    mockError = new Error('Bad things man.');
    mockConfig = { mocked: true };

    getGasketConfigStub = sinon.stub();
    assignPresetConfigStub = sinon.stub().callsFake(config => config);
    warnStub = sinon.stub();
    errorStub = sinon.stub();
    parseStub = sinon.stub().returns();
    execStub = sinon.stub().returns();

    class MockCommand {}
    MockCommand.flags = {};

    const mockImports = {
      '@gasket/engine': class PluginEngine { async exec() { execStub(...arguments); } },
      '@gasket/plugin-command': { GasketCommand: MockCommand },
      '@gasket/resolve': { loadGasketConfigFile: getGasketConfigStub, assignPresetConfig: assignPresetConfigStub },
      '@oclif/parser': { parse: parseStub }
    };

    pluginEngineSpy = sinon.spy(mockImports, '@gasket/engine');

    const _initHook = proxyquire('../../../src/hooks/init', mockImports);

    initHook = function mockInitHook() {
      return _initHook.apply({ warn: warnStub, error: errorStub }, arguments);
    };

    parseStub.returns({ flags: { root: '/path/to/app', config: 'gasket.config' } });
  });

  afterEach(function () {
    sinon.restore();
    delete process.env.GASKET_ENV;
    delete process.env.GASKET_CONFIG;
    delete process.env.GASKET_ROOT;
    delete process.env.GASKET_COMMAND;
  });

  it('ends early for create command', async () => {
    await initHook({ id: 'create' });
    assume(getGasketConfigStub).not.called();
  });

  it('parses flags', async () => {
    await initHook({ id: 'build', argv: [] });
    assume(parseStub).called();
  });

  it('set env vars from flags', async () => {
    assume(process.env).not.property('GASKET_ENV');
    assume(process.env).not.property('GASKET_ROOT');
    assume(process.env).not.property('GASKET_CONFIG');
    assume(process.env).not.property('GASKET_COMMAND');

    await initHook({ id: 'build', argv: [] });

    assume(process.env.GASKET_ENV).equals('development');
    assume(process.env.GASKET_ROOT).equals('/path/to/app');
    assume(process.env.GASKET_CONFIG).equals('gasket.config');
    assume(process.env.GASKET_COMMAND).equals('build');
  });

  it('gets the gasket.config', async () => {
    await initHook({ id: 'build', argv: [] });
    assume(getGasketConfigStub).called();
  });

  it('instantiates plugin engine with config', async () => {
    getGasketConfigStub.resolves(mockConfig);
    await initHook({ id: 'build', argv: [], config: {} });
    assume(pluginEngineSpy).calledWithMatch(mockConfig);
  });

  it('instantiates plugin engine resolveFrom root', async () => {
    getGasketConfigStub.resolves(mockConfig);
    await initHook({ id: 'build', argv: [], config: {} });
    assume(pluginEngineSpy).calledWith(sinon.match.object, { resolveFrom: '/path/to/app' });
  });

  it('assigns config from presets', async () => {
    getGasketConfigStub.resolves(mockConfig);
    await initHook({ id: 'build', argv: [] });
    assume(assignPresetConfigStub).called();
  });

  it('executes initOclif gasket lifecycle', async () => {
    getGasketConfigStub.resolves(mockConfig);
    await initHook({ id: 'build', argv: [], config: {} });
    assume(execStub).calledWith('initOclif', sinon.match.object);
  });

  it('warns if no env specified', async () => {
    getGasketConfigStub.resolves(null);
    await initHook({ id: 'build', argv: [], config: {} });
    assume(warnStub).calledWith('No env specified, falling back to "development".');
  });

  it('does not warn if no env specified for help command', async () => {
    getGasketConfigStub.resolves(null);
    await initHook({ id: 'help', argv: [], config: {} });
    assume(warnStub).not.calledWith('No env specified, falling back to "development".');
  });

  it('warns if no gasket.config was found', async () => {
    getGasketConfigStub.resolves(null);
    await initHook({ id: 'build', argv: [], config: {} });
    assume(warnStub).calledWith('No gasket.config file was found.');
  });

  it('does not warn if no gasket.config was found for help command', async () => {
    getGasketConfigStub.resolves(null);
    sinon.resetHistory();
    await initHook({ id: 'help', argv: [], config: {} });
    assume(warnStub).not.calledWith('No gasket.config file was found.');
  });

  it('errors and exits if problem getting gasket.config', async () => {
    getGasketConfigStub.rejects(mockError);
    await initHook({ id: 'build', argv: [], config: {} });
    assume(errorStub).calledWith(mockError, { exit: 1 });
  });
});
