import { Command } from 'commander';
const program = new Command();
import { processArgs } from './process-args.js';
import { processOptions } from './process-options.js';
import { createOption } from './create-option.js';

/**
 * isValidCommand - Validates the command configuration
 * @param {CLICommand} command The command configuration
 * @returns {boolean} True if valid, false otherwise
 */
function isValidCommand(command) {
  const keys = Object.keys(command);
  return keys.length &&
    keys.length <= 7 &&
    command &&
    command.id &&
    command.description &&
    command.action &&
    typeof command.action === 'function';
}

/**
 * processCommand - Process the command configuration
 * @param {CLICommand} command The command configuration
 * @returns {ProccesedCLICommand} The command instance
 */
export function processCommand(command) {
  if (!isValidCommand(command)) throw new Error('Invalid command configuration');
  const { id, description, action, args, options, hidden = false, default: isDefault = false } = command;
  const cmd = program
    .command(id)
    .description(description)
    .action(action);

  if (args) {
    const cmdArgs = processArgs(args);
    cmdArgs.forEach(arg => cmd.argument(...arg));
  }

  if (options) {
    const cmdOpts = processOptions(options);
    cmdOpts.forEach(o => {
      const option = createOption(o);
      cmd.addOption(option);
    });
  }

  return { command: cmd, hidden, isDefault };
}
