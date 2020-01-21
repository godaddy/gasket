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
     * @param {object} data - init data
     * @param {object} data.oclifConfig - oclif configuration
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
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [{
          name: 'getCommands',
          method: 'exec',
          description: 'Allows plugins to add CLI commands',
          link: 'README.md#getCommands',
          parent: 'initOclif'
        }, {
          name: 'init',
          method: 'exec',
          description: 'Signals the start of any Gasket command before it is run',
          link: 'README.md#init',
          command: '*'
        }, {
          name: 'configure',
          method: 'execWaterfall',
          description: 'Allows plugins to adjust config before command is run',
          link: 'README.md#configure',
          command: '*',
          after: 'init'
        }]
      };
    }
  },
  GasketCommand
};
