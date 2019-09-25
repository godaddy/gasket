const { Command } = require('@oclif/config');
const GasketCommand = require('./command');

module.exports = {
  name: 'command',
  hooks: {
    /**
     * Gets commands from plugins and injects them to the oclif config.
     *
     * @param {Gasket} gasket - Gasket API
     * @param {Object} oclifConfig - oclif configuration
     * @async
     */
    async initOclif(gasket, { oclifConfig }) {
      const commandArrays = await gasket.exec('getCommands', { GasketCommand });

      oclifConfig.plugins.push({
        name: 'Plugin gasket commands',
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
  },
  GasketCommand
};
