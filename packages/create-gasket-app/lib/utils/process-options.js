/**
 * isValidOption - Validate the option
 * @type {import('../internal').isValidOption}
 */
function isValidOption(option) {
  const keys = Object.keys(option);
  return !!keys.length &&
    !!(keys.length <= 5) &&
    !!option.name &&
    !!option.description;
}

/**
 * processOptions - Process the options configuration
 * @type {import('../internal').processOptions}
 */
export function processOptions(options) {
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
