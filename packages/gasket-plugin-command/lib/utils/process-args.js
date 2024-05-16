/**
 * isValidArg - Validates the argument configuration
 * @param {import('../index.d.ts').GasketArgDefinition} arg The argument configuration
 * @returns {boolean} True if valid, false otherwise
 */
function isValidArg(arg) {
  const keys = Object.keys(arg);
  if (arg.required && arg.default) return false;
  const isValid = keys.length &&
    keys.length <= 4 &&
    arg.name && arg.description;
  return Boolean(isValid);
}

/**
 * processArgs - Process the arguments configuration
 * @param {import('../index.d.ts').GasketArgDefinition[]} args Array of argument configurations
 * @returns {import('../index.d.ts').GasketCommandArg[]} Array of argument definitions
 */
export function processArgs(args) {
  if (!Array.isArray(args) || !args.every(isValidArg)) throw new Error('Invalid argument(s) configuration');

  return args.reduce((acc, arg) => {
    const def = [];
    const { name, description, required = false, default: defaultValue } = arg;
    if (required) {
      def.push(`<${name}>`, description);
    } else {
      def.push(`[${name}]`, description);
    }

    if (defaultValue) def.push(defaultValue);

    acc.push(def);
    return acc;
  }, []);
}
