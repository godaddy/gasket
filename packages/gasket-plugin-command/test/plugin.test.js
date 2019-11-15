const assume = require('assume');
const sinon = require('sinon');
const plugin = require('../lib/plugin');
const GasketCommand = require('../lib/command');


describe('Plugin', () => {
  let gasket, execStub, oclifConfig, MockCmdA, MockCmdB, MockCmdC;

  beforeEach(() => {
    execStub = sinon.stub();
    gasket = {
      exec: execStub
    };
    oclifConfig = { plugins: [] };

    MockCmdA = class extends GasketCommand {};
    MockCmdA.id = 'a';
    MockCmdB = class extends GasketCommand {};
    MockCmdB.id = 'b';
    MockCmdC = class extends GasketCommand {};
    MockCmdC.id = 'c';
  });

  it('is an object', () => {
    assume(plugin).is.an('object');
  });

  it('has expected name', () => {
    assume(plugin).to.have.property('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'initOclif'
    ];

    assume(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
  });

  describe('initOclif hook', () => {

    it('executes getCommands lifecycle', async () => {
      execStub.resolves([]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      assume(execStub).calledWith('getCommands');
    });

    it('passes GasketCommand to getCommands lifecycle args', async () => {
      execStub.resolves([]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      const results = execStub.getCall(0).args[1];
      assume(results).property('GasketCommand', GasketCommand);
    });

    it('passes oclif flags to getCommands lifecycle args', async () => {
      execStub.resolves([]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      const results = execStub.getCall(0).args[1];
      assume(results).property('flags', require('@oclif/command').flags);
    });

    it('injects plugin with commands to oclifConfig', async () => {
      execStub.resolves([MockCmdA]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      assume(oclifConfig.plugins).lengthOf(1);
      assume(oclifConfig.plugins[0].name).equals('Gasket commands');
      assume(oclifConfig.plugins[0].commands[0].id).equals(MockCmdA.id);
    });

    it('flattens and filters undefined for getCommands results', async () => {
      // eslint-disable-next-line no-undefined
      execStub.resolves([[MockCmdA, undefined], MockCmdB, [undefined, MockCmdC], undefined]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      assume(oclifConfig.plugins[0].commands).lengthOf(3);
    });

    it('hoists flags from base GasketCommand', async () => {
      execStub.resolves([MockCmdA]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      assume(MockCmdA).property('flags');
      assume(MockCmdA.flags).eqls(GasketCommand.flags);
    });

    it('adds load method to injected Command', async () => {
      execStub.resolves([MockCmdA]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      const injectedCmd = oclifConfig.plugins[0].commands[0];
      assume(injectedCmd).property('load');
      assume(injectedCmd.load).instanceOf(Function);
    });
  });
});
