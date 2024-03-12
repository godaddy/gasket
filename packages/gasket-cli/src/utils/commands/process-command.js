const { Command, Option } = require('commander');
const program = new Command();
const processArgs = require('./process-args');
const processOptions = require('./process-options');

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
function processCommand(command) {
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
      const option = new Option(...o.options);
      const { defaultValue, conflicts, parse, required } = o;
      const optHidden = o.hidden || false;

      if (conflicts.length) option.conflicts(o.conflicts);
      if (optHidden) option.hideHelp();
      if (defaultValue) option.default(defaultValue);
      if (parse) option.argParser(parse);
      if (required) option.required();

      cmd.addOption(option);
    });
  }

  return { command: cmd, hidden, isDefault };
}

module.exports = processCommand;
