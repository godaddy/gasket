const proxyquire = require('proxyquire');
const sinon = require('sinon');
const assume = require('assume');

const getGasketConfigStub = sinon.stub();
const assignPresetConfigStub = sinon.stub().callsFake(config => config);
const warnStub = sinon.stub();
const errorStub = sinon.stub();
const parseStub = sinon.stub().returns();
const execStub = sinon.stub().returns();

const mockError = new Error('Bad things man.');
const mockConfig = { mocked: true };

class MockCommand {}

MockCommand.flags = {};

const mockImports = {
  '@gasket/plugin-engine': class PluginEngine { async exec() { execStub(...arguments); } },
  '@gasket/command-plugin': { GasketCommand: MockCommand },
  '../config/utils': { getGasketConfig: getGasketConfigStub, assignPresetConfig: assignPresetConfigStub },
  '@oclif/parser': { parse: parseStub }
};

const pluginEngineSpy = sinon.spy(mockImports, '@gasket/plugin-engine');

const _initHook = proxyquire('../../../src/hooks/init', mockImports);

function initHook() {
  return _initHook.apply({ warn: warnStub, error: errorStub }, arguments);
}

describe('init hook', () => {

  beforeEach(() => {
    sinon.resetHistory();
    parseStub.returns({ flags: { root: '/path/to/app', config: 'gasket.config' } });
  });

  it('ends early for create command', async () => {
    await initHook({ id: 'create' });
    assume(getGasketConfigStub).not.called();
  });

  it('parses flags', async () => {
    await initHook({ id: 'build', argv: [] });
    assume(parseStub).called();
  });

  it('gets the gasket.config', async () => {
    await initHook({ id: 'build', argv: [] });
    assume(getGasketConfigStub).called();
  });

  it('instantiates plugin engine with config', async () => {
    getGasketConfigStub.resolves(mockConfig);
    await initHook({ id: 'build', argv: [], config: {} });
    assume(pluginEngineSpy).calledWith(mockConfig);
  });

  it('instantiates plugin engine resolveFrom root', async () => {
    getGasketConfigStub.resolves(mockConfig);
    await initHook({ id: 'build', argv: [], config: {} });
    assume(pluginEngineSpy).calledWith(sinon.match.object, { resolveFrom: '/path/to/app' });
  });

  it('assigns config from presets', async () => {
    await initHook({ id: 'build', argv: [] });
    assume(assignPresetConfigStub).called();
  });

  it('executes initOclif gasket lifecycle', async () => {
    getGasketConfigStub.resolves(mockConfig);
    await initHook({ id: 'build', argv: [], config: {} });
    assume(execStub).calledWith('initOclif', sinon.match.object);
  });

  it('warns if no gasket.config was found', async () => {
    getGasketConfigStub.resolves(null);
    await initHook({ id: 'build', argv: [], config: {} });
    assume(warnStub).calledWith('No gasket.config file was found.');
  });

  it('does not warn for help command if no gasket.config was found', async () => {
    getGasketConfigStub.resolves(null);
    await initHook({ id: 'help', argv: [], config: {} });
    assume(warnStub).not.calledWith('No gasket.config file was found.');
  });

  it('errors and exits if problem getting gasket.config', async () => {
    getGasketConfigStub.rejects(mockError);
    await initHook({ id: 'build', argv: [], config: {} });
    assume(errorStub).calledWith(mockError, { exit: 1 });
  });
});
