/**
 * isValidArg - Validates the argument configuration
 * @param {CLICommandArg} arg The argument configuration
 * @returns {boolean} True if valid, false otherwise
 */
function isValidArg(arg) {
  const keys = Object.keys(arg);
  if (arg.required && arg.default) return false;
  return keys.length &&
    keys.length <= 4 &&
    arg.name && arg.description;
}

/**
 * processArgs - Process the arguments configuration
 * @param {CLICommandArg[]} args Array of argument configurations
 * @returns {ProccesedCLICommandArg[]} Array of argument definitions
 */
function processArgs(args) {
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

module.exports = processArgs;
