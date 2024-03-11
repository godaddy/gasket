const { Command, Option } = require('commander');
const program = new Command();
const processArgs = require('./process-args');
const processOptions = require('./process-options');

/**
 * isValidCommand - Validates the command configuration
 * @param {object} command The command configuration
 * @returns {boolean} True if valid, false otherwise
 */
function isValidCommand(command) {
  const keys = Object.keys(command);
  return keys.length &&
    keys.length <= 5 &&
    command &&
    command.id &&
    command.description &&
    command.action &&
    typeof command.action === 'function';
}

/**
 * processCommand - Process the command configuration
 * @param {object} command The command configuration
 * @returns {Command} The command instance
 */
function processCommand(command) {
  if (!isValidCommand(command)) throw new Error('Invalid command configuration');
  const cmd = program
    .command(command.id)
    .description(command.description)
    .action(command.action);

  if (command.args) {
    const args = processArgs(command.args);
    args.forEach(arg => cmd.argument(...arg));
  }

  if (command.options) {
    const opts = processOptions(command.options);
    opts.forEach(o => {
      if (o.conflicts.length) {
        cmd.addOption(new Option(...o.options).conflicts(o.conflicts));
      } else {
        cmd.option(...o.options);
      }
    });
  }

  return cmd;
}

module.exports = processCommand;
