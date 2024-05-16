/* eslint-disable no-unused-vars, no-sync */
import { gasketBin, processCommand } from './cli.js';
const isGasketCommand = /\/gasket\.(js|ts)$/;

/** @type {import('@gasket/core').HookHandler<'configure'>} */
export default function configure(gasket, config) {
  const hasGasket = process.argv.some(arg => isGasketCommand.test(arg));

  if (hasGasket) {
    const cmds = gasket.execSync('commands');
    cmds.forEach(cmd => {
      const { command, hidden, isDefault } = processCommand(cmd);
      gasketBin.addCommand(command, { hidden, isDefault });
    });

    gasketBin.parse();
  }
}
