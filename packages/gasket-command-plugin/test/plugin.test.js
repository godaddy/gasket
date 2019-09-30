const assume = require('assume');
const sinon = require('sinon');
const { flags } = require('@oclif/command');
const plugin = require('../lib/plugin');
const GasketCommand = require('../lib/command');


describe('The plugin', () => {
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
      assume(results).property('flags', flags);
    });

    it('injects plugin with commands to oclifConfig', async () => {
      execStub.resolves([MockCmdA]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      assume(oclifConfig.plugins).lengthOf(1);
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

    it('retains flags set on extended class', async () => {
      MockCmdA.flags = {
        bogus: flags.string({
          description: 'A bogus flag'
        })
      };
      execStub.resolves([MockCmdA]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      assume(Object.keys(MockCmdA.flags)).eqls(
        Object.keys(GasketCommand.flags).concat('bogus')
      );
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
