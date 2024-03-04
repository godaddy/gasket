// Testing only, not a real plugin
module.exports = {
  name: require('../package').name,
  hooks: {
    // Just an example of a global command flag that could be added
    async getCommandOptions() {
      return [
        {
          name: 'record',
          description: 'Whether or not to emit this command as part of Gasket\'s metrics lifecycle',
          default: true,
        }
      ];
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
  }
};
