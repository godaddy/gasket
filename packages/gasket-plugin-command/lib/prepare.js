import { gasketBin } from './cli.js';
import { processCommand } from './utils/process-command.js';

/** @type {import('@gasket/core').HookHandler<'prepare'>} */
export default function prepare(gasket, config) {
  if (!config.command) return config;

  /** @type {(import('./index.d.ts').GasketCommandDefinition | import('./index.d.ts').GasketCommandDefinition[])[]} */
  const cmdDefs = gasket.execSync('commands');

  // Flatten in case some plugins return arrays
  const flattenedCmdDefs = cmdDefs.flatMap(cmdDef => Array.isArray(cmdDef) ? cmdDef : [cmdDef]);

  flattenedCmdDefs.forEach((cmdDef) => {
    const { command, hidden, isDefault } = processCommand(cmdDef);
    gasketBin.addCommand(command, { hidden, isDefault });
  });

  return config;
}
