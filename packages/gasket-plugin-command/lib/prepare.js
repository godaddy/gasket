/* eslint-disable no-sync */
import { gasketBin } from './cli.js';
import { processCommand } from './utils/process-command.js';

/** @type {import('@gasket/core').HookHandler<'prepare'>} */
export default function prepare(gasket, config) {

  /** @type {import('./index.js').GasketCommandDefinition[]} */
  const cmdDefs = gasket.execSync('commands');

  cmdDefs.forEach((cmdDef) => {
    const { command, hidden, isDefault } = processCommand(cmdDef);
    gasketBin.addCommand(command, { hidden, isDefault });
  });

  return config;
}
