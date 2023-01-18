const plugin = require('../lib/plugin');
const GasketCommand = require('../lib/command');


describe('Plugin', () => {
  let gasket, execStub, oclifConfig, MockCmdA, MockCmdB, MockCmdC;

  beforeEach(() => {
    execStub = jest.fn();
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
    expect(plugin).toEqual(expect.any(Object));
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'initOclif',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  describe('initOclif hook', () => {

    it('executes getCommands lifecycle', async () => {
      execStub.mockResolvedValue([]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      expect(execStub).toHaveBeenCalledWith('getCommands', expect.any(Object));
    });

    it('passes GasketCommand to getCommands lifecycle args', async () => {
      execStub.mockResolvedValue([]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      const results = execStub.mock.calls[0][1];
      expect(results).toHaveProperty('GasketCommand', GasketCommand);
    });

    it('passes oclif flags to getCommands lifecycle args', async () => {
      execStub.mockResolvedValue([]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      const results = execStub.mock.calls[0][1];
      expect(results).toHaveProperty('flags', require('@oclif/command').flags);
    });

    it('injects plugin with commands to oclifConfig', async () => {
      execStub.mockResolvedValue([MockCmdA]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      expect(oclifConfig.plugins).toHaveLength(1);
      expect(oclifConfig.plugins[0].name).toEqual('Gasket commands');
      expect(oclifConfig.plugins[0].commands[0].id).toEqual(MockCmdA.id);
    });

    it('flattens and filters undefined for getCommands results', async () => {
      // eslint-disable-next-line no-undefined
      execStub.mockResolvedValue([[MockCmdA, undefined], MockCmdB, [undefined, MockCmdC], undefined]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      expect(oclifConfig.plugins[0].commands).toHaveLength(3);
    });

    it('hoists flags from base GasketCommand', async () => {
      execStub.mockResolvedValue([MockCmdA]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      expect(MockCmdA).toHaveProperty('flags');
      expect(MockCmdA.flags).toEqual(GasketCommand.flags);
    });

    it('adds load method to injected Command', async () => {
      execStub.mockResolvedValue([MockCmdA]);
      await plugin.hooks.initOclif(gasket, { oclifConfig });
      const injectedCmd = oclifConfig.plugins[0].commands[0];
      expect(injectedCmd).toHaveProperty('load');
      expect(injectedCmd.load).toBeInstanceOf(Function);
    });
  });
});
