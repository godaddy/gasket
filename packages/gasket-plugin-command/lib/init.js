/* eslint-disable no-unused-vars, no-sync */
import { applyConfigOverrides } from '@gasket/utils';
import { gasketBin, processCommand } from './cli.js';
const isGasketCommand = /\/gasket\.(js|ts|cjs|mjs)$/;

/** @type {import('@gasket/core').HookHandler<'ready'>} */
export default async function init(gasket) {
  const hasGasket = process.argv.some(arg => isGasketCommand.test(arg));

  if (hasGasket) {
    const cmds = await gasket.execSync('commands');
    cmds.forEach(cmd => {
      const { command, hidden, isDefault } = processCommand(cmd);
      gasketBin.addCommand(command, { hidden, isDefault });
    });

    // TODO: parse the command line arguments to get the running command name
    // gasket.config.command = 'name-of-command';

    // TODO: apply command-based configuration overrides
    // applyConfigOverrides(gasket.config, { command });
  }
}
