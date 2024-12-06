/**
 * Validate the option
 * @type {import('../internal.d.ts').isValidOption}
 */
function isValidOption(option) {
  const keys = Object.keys(option);
  const isValid =
    keys.length && keys.length <= 5 && option.name && option.description;
  return Boolean(isValid);
}

/**
 * Process the options configuration
 * @type {import('../internal.d.ts').processOptions}
 */
export function processOptions(options) {
  if (!Array.isArray(options) || !options.every(isValidOption))
    throw new Error('Invalid option(s) configuration');

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
    acc.push({
      options: def,
      conflicts,
      hidden,
      defaultValue,
      parse,
      required
    });

    return acc;
  }, []);
}
