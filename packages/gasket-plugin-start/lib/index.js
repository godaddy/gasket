import create from './create.js';
import getCommands from './get-commands.js';
import { default as pkg } from '../package.json' assert { type: 'json' };

export const hooks = {
  name: pkg.name,
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
