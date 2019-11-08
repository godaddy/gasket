const { Command } = require('@oclif/config');
const { flags } = require('@oclif/command');
const GasketCommand = require('./command');
const { hoistBaseFlags } = require('./utils');

module.exports = {
  name: require('../package').name,
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
        name: 'Gasket commands',
        hooks: {},
        topics: [],
        commands
      });
    }
  },
  GasketCommand
};
