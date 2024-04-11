/**
 * isValidOption - Validate the option
 * @param {CLICommandOption} option The option configuration
 * @returns {boolean} True if valid, false otherwise
 */
function isValidOption(option) {
  const keys = Object.keys(option);
  return keys.length &&
    keys.length <= 5 &&
    option.name &&
    option.description;
}

/**
 * processOptions - Process the options configuration
 * @param {CLICommandOption[]} options Array of option configurations
 * @returns {ProccesedCLICommandOption[]} Processed option definitions
 */
function processOptions(options) {
  if (!Array.isArray(options) || !options.every(isValidOption)) throw new Error('Invalid option(s) configuration');

  return options.reduce((acc, option) => {
    const def = [];
    const {
      name,
      description,
      required = false,
      short,
      parse,
      type = 'string',
      conflicts = [],
      hidden = false,
      default: defaultValue
    } = option;

    const format = required ? `<${name}>` : `[${name}]`;
    const flags = short ? `-${short}, --${name}` : `--${name}`;

    def.push(`${flags}${type !== 'boolean' ? ` ${format}` : ''}`, description);
    acc.push({ options: def, conflicts, hidden, defaultValue, parse, required });

    return acc;
  }, []);
}

module.exports = processOptions;