const plugin = require('..');

class MockBaseCommand {}

describe('The plugin', () => {
  let gasket;

  beforeEach(() => {
    gasket = {
      exec: jest.fn()
    };
  });

  describe('initOclif hook', () => {
    it('injects a plugin with commands from getCommands hooks', async () => {
      const oclifConfig = { plugins: [] };
      gasket.exec.mockImplementation(async (event, args) => {
        if (event === 'getCommands') {
          class SomeCommand extends args.BaseCommand {}
          SomeCommand.id = 'new';
          return [SomeCommand];
        }
      });

      await plugin.hooks.initOclif(gasket, {
        oclifConfig,
        BaseCommand: MockBaseCommand
      });

      expect(gasket.exec).toBeCalledWith('getCommands', {
        oclifConfig,
        BaseCommand: MockBaseCommand
      });

      const injectedPlugin = oclifConfig.plugins[0];
      expect(injectedPlugin.commands).toHaveLength(1);

      const injectedCommandMeta = injectedPlugin.commands[0];
      expect(injectedCommandMeta).toHaveProperty('id', 'new');
      expect(injectedCommandMeta).toHaveProperty('load');

      const Command = await injectedCommandMeta.load();
      expect(typeof Command).toEqual('function');

      const command = new Command();
      expect(command).toBeInstanceOf(MockBaseCommand);
    });
  });
});
