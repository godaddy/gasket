/// <reference types="@gasket/plugin-metadata" />

const create = require('./create');
const getCommands = require('./get-commands');
const { name } = require('../package.json');

/** @type {import('@gasket/engine').Plugin} */
const plugin = {
  name,
  hooks: {
    create,
    getCommands,
    metadata(gasket, meta) {
      return {
        ...meta,
        commands: [{
          name: 'build',
          description: 'Prepare the app to be started',
          link: 'README.md#build-command'
        }, {
          name: 'start',
          description: 'Run the prepared app',
          link: 'README.md#start-command'
        }, {
          name: 'local',
          description: 'Build and start the app in development mode',
          link: 'README.md#local-command'
        }],
        lifecycles: [{
          name: 'build',
          method: 'exec',
          description: 'Prepare the app to be started',
          link: 'README.md#build',
          command: 'build'
        }, {
          name: 'preboot',
          method: 'exec',
          description: 'Any setup before the app starts',
          link: 'README.md#start'
        }, {
          name: 'start',
          method: 'exec',
          description: 'Run the prepared app',
          link: 'README.md#start',
          command: 'start',
          after: 'preboot'
        }]
      };
    }
  }
};

module.exports = plugin;
