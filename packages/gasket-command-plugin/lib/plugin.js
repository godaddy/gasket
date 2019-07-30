const { Command } = require('@oclif/config');

module.exports = {
  hooks: {
    async initOclif(gasket, { oclifConfig, BaseCommand }) {
      const commandArrays = await gasket.exec('getCommands', {
        oclifConfig,
        BaseCommand
      });

      oclifConfig.plugins.push({
        name: 'External gasket commands',
        hooks: {},
        topics: [],
        commands: commandArrays
          .reduce((all, commands) => all.concat(commands), [])
          .map(cmd => ({
            ...Command.toCached(cmd),
            load: () => cmd
          }))
      });
    }
  }
};
