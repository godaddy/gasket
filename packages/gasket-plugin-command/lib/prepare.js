/* eslint-disable no-sync */
import { gasketBin } from './cli.js';
import { processCommand } from './utils/process-command.js';

/** @type {import('@gasket/core').HookHandler<'prepare'>} */
export default function prepare(gasket, config) {
  if (!config.command) return config;

  /** @type {import('./index.d.ts').GasketCommandDefinition[]} */
  const cmdDefs = gasket.execSync('commands');

  const commandArray = cmdDefs.flat().filter(Boolean);

  commandArray.forEach((cmdDef) => {
    const { command, hidden, isDefault } = processCommand(cmdDef);
    gasketBin.addCommand(command, { hidden, isDefault });
  });

  return config;
}
