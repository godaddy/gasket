/* eslint-disable no-unused-vars, no-sync */
import { gasketBin, processCommand } from './cli.js';
const isGasketCommand = /\/gasket\.(js|ts|cjs|mjs)$/;

/** @type {import('@gasket/core').HookHandler<'ready'>} */
export default async function readyHook(gasket) {
  const hasGasket = process.argv.some(arg => isGasketCommand.test(arg));

  if (hasGasket) {
    const cmds = await gasket.exec('commands');
    cmds.forEach(cmd => {
      const { command, hidden, isDefault } = processCommand(cmd);
      gasketBin.addCommand(command, { hidden, isDefault });
    });

    gasketBin.parse();
  }
}
