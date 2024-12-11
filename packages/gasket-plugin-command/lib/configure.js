// @ts-nocheck
/* eslint-disable no-unused-vars, no-sync */
import { applyConfigOverrides } from '@gasket/utils';
import { gasketBin, processCommand } from './cli.js';
const isGasketCommand = /gasket[.-\w]*\.(js|ts|cjs|mjs)$/;

export default {
  timing: {
    first: true
  },
  /** @type {import('@gasket/core').HookHandler<'configure'>} */
  handler: function configure(gasket, config) {
    const hasGasket = process.argv.some(arg => isGasketCommand.test(arg));

    if (hasGasket) {
      const cmds = gasket.execSync('commands');
      const commandIds = cmds.reduce((acc, cmd) => {
        acc[cmd.id] = true;
        return acc;
      }, Object());

      cmds.forEach(cmd => {
        const { command, hidden, isDefault } = processCommand(cmd);
        gasketBin.addCommand(command, { hidden, isDefault });
      });

      const commandId = [...process.argv].filter(arg => commandIds[arg])[0];
      return {
        command: commandId,
        ...applyConfigOverrides(config, { env: gasket.config.env, commandId })
      };
    }

    return config;
  }
};

