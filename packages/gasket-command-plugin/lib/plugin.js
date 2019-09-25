const { Command } = require('@oclif/config');
const { flags } = require('@oclif/command');
const GasketCommand = require('./command');

function hoistBaseFlags(cmd) {
  cmd.flags = {
    ...GasketCommand.flags,
    ...(cmd.flags || {})
  };
  return cmd;
}

module.exports = {
  name: 'command',
  hooks: {
    /**
     * Gets commands from plugins and injects them to the oclif config.
     *
     * @param {Gasket} gasket - Gasket API
     * @param {Object} data - init data
     * @param {Object} data.oclifConfig - oclif configuration
     * @async
     */
    async initOclif(gasket, { oclifConfig }) {
      const commands = (await gasket.exec('getCommands', { GasketCommand, flags }))
        .reduce((all, cmds) => all.concat(cmds), [])
        .filter(cmd => Boolean(cmd))
        .map(cmd => hoistBaseFlags(cmd))
        .map(cmd => ({
          ...Command.toCached(cmd),
          load: () => cmd
        }));

      oclifConfig.plugins.push({
        name: 'Plugin gasket commands',
        hooks: {},
        topics: [],
        commands
      });
    }
  },
  GasketCommand
};
